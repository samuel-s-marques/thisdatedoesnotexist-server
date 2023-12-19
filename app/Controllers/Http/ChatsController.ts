import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Chat from 'App/Models/Chat'
import User from 'App/Models/User'

export default class ChatsController {
  public async index({ request, response }: HttpContextContract) {
    try {
      const page = request.input('page', 1)
      const searchQuery = request.qs()
      const uid = searchQuery.uid

      if (!uid) {
        return response.status(400).json({ error: 'User ID is required.' })
      }

      const user = await User.query().where('uid', uid).firstOrFail()
      const chats = await Chat.query().where('user_id', user.id).orderBy('updatedAt', 'desc').preload('character').paginate(page, 40)

      return chats
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }
}
