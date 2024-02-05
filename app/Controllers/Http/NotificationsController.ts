import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Notification from 'App/Models/Notification'
import User from 'App/Models/User'

export default class NotificationsController {
  public async index({ request, response }: HttpContextContract) {
    try {
      const page = request.input('page', 1)

      const user = await User.findByOrFail('uid', request.token.uid)
      const notifications = await Notification.query()
        .where('user_id', user.id)
        .orderBy('updatedAt', 'desc')
        .paginate(page, 40)

      return notifications
    } catch (error) {
      return response.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: `Error getting user status: ${error.message}`,
        },
      })
    }
  }
}
