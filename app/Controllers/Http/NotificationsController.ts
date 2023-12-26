import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Notification from 'App/Models/Notification'
import User from 'App/Models/User'

export default class NotificationsController {
  public async index({ request, response }: HttpContextContract) {
    try {
      const page = request.input('page', 1)
      const searchQuery = request.qs()
      const uid = searchQuery.uid

      if (!uid) {
        return response.status(400).json({ error: 'User UID is required.' })
      }

      const user = await User.findByOrFail('uid', uid)
      const notifications = await Notification.query().where('user_id', user.id).paginate(page, 40)

      return notifications
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }
}
