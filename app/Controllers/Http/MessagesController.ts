import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Message from 'App/Models/Message'
import Chat from 'App/Models/Chat'

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
}
