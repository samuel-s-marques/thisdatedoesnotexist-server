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
import admin from 'Config/firebase_database'
WsService.boot()

const textGenApi = new TextGenerationService()
const notificationService = new NotificationService()

const clients = {}

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
  let prompt = `{{system_sequence_prefix}}{{system_prompt}}\n${message}`
  prompt = replaceMacros(prompt, character, user)

  return await textGenApi.sendPrompt(prompt)
}

function sendSystemMessage(ws: WebSocket, message: string, show = false, status = 'success') {
  ws.send(
    JSON.stringify({
      type: 'system',
      status: status,
      show: show,
      message: message,
    })
  )
}

WsService.wss.on('connection', (ws) => {
  const id = uuidv4()
  Logger.info(`Client connected with id ${id}`)

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: 'system',
        status: 'success',
        show: false,
        message: 'Connected.',
      })
    )
  }

  ws.on('error', (error) => {
    Logger.error(`Client ${id} error: ${error}`)
  })

  ws.on('message', async (data, isBinary) => {
    try {
      const message = isBinary ? data : JSON.parse(data.toString())

      if (message.type == 'auth') {
        let userId = message.user_id
        let token = message.token

        if (!userId || !token) {
          Logger.error(`Client ${id} error: missing user_id or token`)
          sendSystemMessage(ws, 'Unauthorized.', true, 'error')
          return
        }

        try {
          await admin.auth().verifyIdToken(token)
          clients[id] = userId

          Logger.info(`Client ${id} authorized with user_id ${userId}`)
          sendSystemMessage(ws, 'Authorized.', false, 'success')
        } catch (error) {
          Logger.error(`Unauthorized: Token verification failed. ${error}`)
          sendSystemMessage(ws, 'Unauthorized.', true, 'error')

          return
        }
      }

      if (clients[id] === undefined) {
        Logger.error(`Unauthorized: Client ${id} is not authorized.`)
        sendSystemMessage(ws, 'Unauthorized.', false, 'error')

        return
      }

      if (message.type == 'chats') {
        Logger.info(`Client ${id} requested chats`)
        await processChat(ws, message, id)
      }

      if (message.type == 'text') {
        await processMessage(ws, message, id)
      }
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

  ws.on('close', (code, reason) => {
    Logger.info(`Client ${id} disconnected with code ${code} and reason ${reason}`)
    delete clients[id]
  })
})

async function processMessage(ws: WebSocket, message: any, id: string) {
  const character = await User.query()
    .where('uid', message.room_uid)
    .preload('hobbies')
    .preload('personalityTraits')
    .preload('pronoun')
    .preload('relationshipGoal')
    .firstOrFail()
  const chat = await Chat.query().where('character_id', character.id).firstOrFail()
  const user = await User.query()
    .where('uid', message.message.send_by)
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
        type: 'text',
        message: {
          id: uuidv4(),
          type: 'system',
          text: `You have been blocked by ${character.name} ${character.surname}. You cannot send messages to this character anymore.`,
          created_at: DateTime.now(),
        },
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
        type: 'text',
        message: {
          id: uuidv4(),
          type: 'system',
          text: message,
          created_at: DateTime.now(),
        },
      })
    )

    return
  }

  let userMessage = new Message()
  await userMessage.related('chat').associate(chat)
  await userMessage.related('user').associate(user)
  userMessage.content = message.message.text
  await userMessage.save()

  chat.last_message = message.message.text
  await chat.save()
  await processChat(ws, message, id)

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
  const aiResponse = await sendMessage(prompt, character, user)
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
        type: 'text',
        message: {
          id: uuidv4(),
          type: 'system',
          text: `You have been blocked by ${character.name} ${character.surname}. You cannot send messages to this character anymore.`,
          created_at: DateTime.now(),
        },
      })
    )

    return
  }

  processChat(ws, message, id)

  ws.send(
    JSON.stringify({
      type: 'text',
      message: {
        id: uuidv4(),
        type: 'sender',
        text: finalMessage,
        send_by: character.uid,
        created_at: DateTime.now(),
      },
    })
  )
}

async function processChat(ws: WebSocket, message: any, id: string) {
  const user = await User.query().where('uid', clients[id]).firstOrFail()
  let chatsQuery = Chat.query()
    .where('user_id', user.id)
    .orderBy('updatedAt', 'desc')
    .preload('character')

  if (
    message.search != null &&
    message.search != '' &&
    message.search != undefined &&
    message.searching == true
  ) {
    chatsQuery = chatsQuery.whereHas('character', (query) => {
      query
        .where('name', 'like', `%${message.search}%`)
        .orWhere('surname', 'like', `%${message.search}%`)
    })
  }

  const chats = await chatsQuery.paginate(message.page ?? 1, 40)

  ws.send(
    JSON.stringify({
      type: 'chats',
      data: chats,
    })
  )
}
