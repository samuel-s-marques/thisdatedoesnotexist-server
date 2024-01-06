import WsService from 'Service/WsService'
import { v4 as uuidv4 } from 'uuid'
import Logger from '@ioc:Adonis/Core/Logger'
import Message from 'App/Models/Message'
import Chat from 'App/Models/Chat'
import User from 'App/Models/User'
import { promptBuilder, replaceMacros } from '../util/util'
import BlockedUser from 'App/Models/BlockedUser'
import { WebSocket } from 'ws'
import { DateTime } from 'luxon'
import NotificationService from 'Service/NotificationService'
import BannedUser from 'App/Models/BannedUser'
import TextGenerationService from 'Service/TextGenerationService'
WsService.boot()

const textGenApi = new TextGenerationService()
const notificationService = new NotificationService()

function messageCleaner(message: string, character: User, user: User): string {
  const characterPrefix = `${character.name} ${character.surname}:`
  const userPrefix = `${user.name} ${user.surname}:`

  if (message.startsWith(characterPrefix)) {
    message = message.slice(characterPrefix.length).trim()
  } else if (message.endsWith(userPrefix)) {
    message = message.slice(0, -userPrefix.length).trim()
  }

  return message
}

async function sendMessage(message: string, character: User, user: User) {
  let prompt = `[input_sequence][system_prompt]\n${message}`
  prompt = replaceMacros(prompt, character.name, user.name)

  return await textGenApi.sendPrompt(prompt)
}

WsService.wss.on('connection', (ws) => {
  const id = uuidv4()
  Logger.info(`Client connected with id ${id}`)

  ws.on('error', (error) => {
    Logger.error(`Client ${id} error: ${error}`)
  })

  ws.on('message', async (data, isBinary) => {
    try {
      const message = isBinary ? data : JSON.parse(data.toString())
      await processMessage(ws, message)
    } catch (error) {
      Logger.error(`Client ${id} error: ${error}`)
      ws.send(
        JSON.stringify({
          type: 'system',
          status: 'error',
          message: 'Something went wrong. Please try again.',
        })
      )
    }
  })
})

async function processMessage(ws: WebSocket, message: any) {
  const character = await User.query()
    .where('uid', message.roomId)
    .preload('hobbies')
    .preload('personalityTraits')
    .preload('pronoun')
    .preload('relationshipGoal')
    .firstOrFail()
  const chat = await Chat.query().where('character_id', character.id).firstOrFail()
  const user = await User.query()
    .where('uid', message.author.id)
    .preload('hobbies')
    .preload('pronoun')
    .preload('relationshipGoal')
    .firstOrFail()
  const blockedUsers = await BlockedUser.query()
    .where('user_id', character.id)
    .andWhere('blocked_user_id', user.id)
    .first()

  if (blockedUsers) {
    ws.send(
      JSON.stringify({
        type: 'system',
        status: 'error',
        message: `You have been blocked by ${character.name} ${character.surname}. You cannot send messages to this character anymore.`,
      })
    )

    return
  }

  if (user.status !== 'normal') {
    let message = 'You cannot send message to this character.'

    if (user.status === 'suspended') {
      message += ` You have been suspended until ${user.statusUntil!.toFormat('dd/MM/yyyy')}.`
    } else {
      message += ` You have been banned.`
    }

    ws.send(
      JSON.stringify({
        type: 'system',
        status: 'error',
        message: message,
      })
    )

    return
  }

  let userMessage = new Message()
  await userMessage.related('chat').associate(chat)
  await userMessage.related('user').associate(user)
  userMessage.content = message.text
  await userMessage.save()

  chat.last_message = message.text
  await chat.save()

  const messagesCountQuery = await Message.query().count('* as total').where('chat_id', chat.id)
  const { total: messagesCount } = messagesCountQuery[0].$extras
  const offset = Math.max(messagesCount - 5, 0)

  const messages = await Message.query()
    .where('chat_id', chat.id)
    .preload('user')
    .orderBy('id', 'asc')
    .offset(offset)
    .limit(5)
  const prompt = promptBuilder(messages, character, user)
  const aiResponse = await sendMessage(
    prompt,
    character,
    user,
  )
  const finalMessage = messageCleaner(aiResponse!.trim(), character, user)

  let characterMessage = new Message()
  await characterMessage.related('chat').associate(chat)
  await characterMessage.related('user').associate(character)
  characterMessage.content = finalMessage
  await characterMessage.save()

  chat.last_message = finalMessage
  await chat.save()

  if (finalMessage.match(/\/block/g)) {
    await character.related('blockedUsers').create({
      blocked_user_id: user.id,
      user_id: character.id,
    })
    user.reportsCount++
    await user.save()

    if (user.reportsCount >= 5 && user.reportsCount < 20) {
      user.status = 'suspended'
      user.statusReason = 'inappropriate content'

      if (user.statusUntil === null) {
        user.statusUntil = DateTime.now().plus({ days: 5 })
      }

      await user.save()

      userMessage.reported = true
      await userMessage.save()

      notificationService.sendNotification('suspended', user.uid)
    }

    if (user.reportsCount >= 20 && user.status !== 'banned') {
      user.status = 'banned'
      user.statusReason = 'inappropriate content'
      await user.save()

      userMessage.reported = true
      await userMessage.save()

      await new BannedUser()
        .fill({
          uid: user.uid,
          email: user.email,
        })
        .save()

      notificationService.sendNotification('banned', user.uid)
    }

    ws.send(
      JSON.stringify({
        type: 'system',
        status: 'error',
        message: `You have been blocked by ${character.name} ${character.surname}. You cannot send messages to this character anymore.`,
      })
    )

    return
  }

  ws.send(
    JSON.stringify({
      id: uuidv4(),
      type: 'text',
      text: finalMessage,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      author: { id: character.uid },
    })
  )
}
