import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class NotificationsController {
  public async index({ request, response }: HttpContextContract) {
    try {
      const searchQuery = request.qs()
      const uid = searchQuery.uid

      if (!uid) {
        return response.status(400).json({ error: 'User UID is required.' })
      }

      const user = await User.findByOrFail('uid', uid)
      const notifications = await user
        .related('notifications')
        .query()
        .orderBy('created_at', 'desc')
        .paginate(40)

      return notifications
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }
}
