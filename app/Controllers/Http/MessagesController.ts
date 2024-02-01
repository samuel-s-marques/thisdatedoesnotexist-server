import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Message from 'App/Models/Message'
import Chat from 'App/Models/Chat'
import fs from 'fs'
import Config from '@ioc:Adonis/Core/Config'

export default class MessagesController {
  public async index({ request, response }: HttpContextContract) {
    try {
      const searchQuery = request.qs()
      const uid = searchQuery.uid

      if (!uid) {
        return response.status(400).json({ error: 'Chat ID is required.' })
      }

      const character = await User.findByOrFail('uid', uid)
      const chat = await Chat.findByOrFail('character_id', character.id)

      const messages = await Message.query()
        .where('chat_id', chat.id)
        .preload('user')
        .orderBy('created_at', 'desc')
        .paginate(searchQuery.page ?? 1, 40)

      return messages
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  public async status({ response }: HttpContextContract) {
    try {
      const modelName = Config.get('app.whisper.model')
      const whisperEnabled = Config.get('app.whisper.enabled')
      const whisperModelExists = fs.existsSync(`whisper\\models\\ggml-${modelName}.bin`)

      const canSendAudio = whisperEnabled && whisperModelExists

      return response.status(200).json({
        audio: canSendAudio,
      })
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }
}
