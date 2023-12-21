import WsService from 'Service/WsService'
import { v4 as uuidv4 } from 'uuid'
import Logger from '@ioc:Adonis/Core/Logger'
import Message from 'App/Models/Message'
import Chat from 'App/Models/Chat'
import User from 'App/Models/User'
import { promptBuilder } from '../util/util'
import OobaboogaService from 'Service/OobaboogaService'
import KoboldService from 'Service/KoboldService'
import Env from '@ioc:Adonis/Core/Env'
import BlockedUser from 'App/Models/BlockedUser'
WsService.boot()

const textGenApi = new KoboldService()

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

WsService.wss.on('connection', (ws) => {
  const id = uuidv4()
  Logger.info(`Client connected with id ${id}`)

  ws.on('error', (error) => {
    Logger.error(`Client ${id} error: ${error}`)
  })

  ws.on('message', async (data, isBinary) => {
    const message = isBinary ? data : JSON.parse(data.toString())
    Logger.info(`Client ${id} sent: ${message}`)

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

    let messageModel = new Message()
    await messageModel.related('chat').associate(chat)
    await messageModel.related('user').associate(user)
    messageModel.content = message.text
    await messageModel.save()

    chat.last_message = message.text
    await chat.save()

    const messagesCountQuery = await Message.query().count('* as total').where('chat_id', chat.id)
    const messagesCount = messagesCountQuery[0].$extras.total
    const offset = Math.max(messagesCount - 5, 0)

    const messages = await Message.query()
      .where('chat_id', chat.id)
      .preload('user')
      .orderBy('id', 'asc')
      .offset(offset)
      .limit(5)
    const prompt = promptBuilder(messages, character, user)
    const aiResponse = await textGenApi.sendMessage(
      prompt,
      character,
      user,
      Env.get('MODEL_INSTRUCTIONS_TYPE')
    )
    const finalMessage = messageCleaner(aiResponse!.trim(), character, user)

    messageModel = new Message()
    await messageModel.related('chat').associate(chat)
    await messageModel.related('user').associate(character)
    messageModel.content = finalMessage
    await messageModel.save()

    chat.last_message = finalMessage
    await chat.save()

    if (finalMessage.match(/\/block/g)) {
      await character.related('blockedUsers').create({
        blocked_user_id: user.id,
        user_id: character.id,
      })

      ws.send(
        JSON.stringify({
          type: 'system',
          text: `You have been blocked by ${character.name} ${character.surname}.`,
        })
      )
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
  })
})
