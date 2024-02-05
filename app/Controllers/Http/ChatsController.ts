import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Chat from 'App/Models/Chat'
import User from 'App/Models/User'
import Config from '@ioc:Adonis/Core/Config'
import fs from 'fs'

export default class ChatsController {
  public async index({ request, response }: HttpContextContract) {
    try {
      const page = request.input('page', 1)

      const user = await User.query().where('uid', request.token.uid).firstOrFail()
      const chats = await Chat.query()
        .where('user_id', user.id)
        .orderBy('updatedAt', 'desc')
        .preload('character')
        .paginate(page, 40)

      return chats
    } catch (error) {
      return response.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: `Error getting chats: ${error.message}`,
        },
      })
    }
  }

  public async settings({ response }: HttpContextContract) {
    try {
      const modelName = Config.get('app.whisper.model')
      const whisperEnabled = Config.get('app.whisper.enabled')
      const whisperModelExists = fs.existsSync(`whisper\\models\\ggml-${modelName}.bin`)

      const canSendAudio = whisperEnabled && whisperModelExists

      return response.status(200).json({
        audio: canSendAudio,
      })
    } catch (error) {
      return response.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: `Error getting settings: ${error.message}`,
        },
      })
    }
  }
}
