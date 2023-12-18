import WsService from 'Service/WsService'
import { v4 as uuidv4 } from 'uuid'
import Logger from '@ioc:Adonis/Core/Logger'
import Message from 'App/Models/Message'
import Chat from 'App/Models/Chat'
import User from 'App/Models/User'
WsService.boot()

WsService.wss.on('connection', (ws) => {
  const id = uuidv4()
  Logger.info(`Client connected with id ${id}`)

  ws.on('error', (error) => {
    Logger.error(`Client ${id} error: ${error}`)
  })

  ws.on('message', async (data, isBinary) => {
    const message = isBinary ? data : JSON.parse(data.toString())
    Logger.info(`Client ${id} sent: ${message}`)

    const character = await User.query().where('uid', message.roomId).firstOrFail()
    const chat = await Chat.query().where('character_id', character.id).firstOrFail()
    const author = await User.query().where('uid', message.author.id).firstOrFail()

    let messageModel = new Message()
    await messageModel.related('chat').associate(chat)
    await messageModel.related('user').associate(author)
    messageModel.content = message.text

    await messageModel.save()
  })
})
