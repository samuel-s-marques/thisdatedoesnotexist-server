import WsService from 'Service/WsService'
import { v4 as uuidv4 } from 'uuid'
import Logger from '@ioc:Adonis/Core/Logger'
import Message from 'App/Models/Message'
import Chat from 'App/Models/Chat'
import User from 'App/Models/User'
import { pListBuilder, promptBuilder } from '../util/util'
import OobaboogaService from 'Service/OobaboogaService'
import KoboldService from 'Service/KoboldService'
WsService.boot()

const textGenApi = new KoboldService()

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
    const author = await User.query()
      .where('uid', message.author.id)
      .preload('hobbies')
      .preload('pronoun')
      .preload('relationshipGoal')
      .firstOrFail()

    let messageModel = new Message()
    await messageModel.related('chat').associate(chat)
    await messageModel.related('user').associate(author)
    messageModel.content = message.text

    await messageModel.save()

    const messages = await Message.query()
      .where('chat_id', chat.id)
      .limit(5)
      .orderBy('createdAt', 'desc')

    const prompt = promptBuilder(messages, character, author)

    const aiResponse = await textGenApi.sendMessage(prompt, character, author)

    let trimmedMessage = aiResponse.trim()

    if (trimmedMessage.startsWith(`${character.name}:`)) {
      trimmedMessage = trimmedMessage.replace(`${character.name}:`, '').trim()
    } else if (trimmedMessage.startsWith(`${character.name} ${character.surname}:`)) {
      trimmedMessage = trimmedMessage.replace(`${character.name} ${character.surname}:`, '').trim()
    } else if (trimmedMessage.endsWith(`${author.name}:`)) {
      trimmedMessage = trimmedMessage.replace(`${author.name}:`, '').trim()
    } else if (trimmedMessage.endsWith(`${author.name} ${author.surname}:`)) {
      trimmedMessage = trimmedMessage.replace(`${author.name} ${author.surname}:`, '').trim()
    }

    const finalMessage = trimmedMessage

    messageModel = new Message()
    await messageModel.related('chat').associate(chat)
    await messageModel.related('user').associate(character)
    messageModel.content = finalMessage
    await messageModel.save()

    ws.send(
      JSON.stringify({
        id: uuidv4(),
        type: 'text',
        text: finalMessage,
        author: { id: character.uid },
      })
    )
  })
})
