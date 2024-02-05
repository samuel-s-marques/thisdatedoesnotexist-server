import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import FeedbackModel from 'App/Models/FeedbackModel'

export default class FeedbacksController {
  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)

    const feedbacks = await FeedbackModel.query()
      .where('user_uid', request.token.uid)
      .orderBy('updatedAt', 'desc')
      .paginate(page, 40)
    return feedbacks
  }

  public async show(ctx: HttpContextContract) {
    const feedback = await FeedbackModel.query().where('id', ctx.params.id).firstOrFail()

    return feedback
  }

  public async store({ request, response }: HttpContextContract) {
    try {
      const existingFeedback = await FeedbackModel.query()
        .where('user_uid', request.token.uid)
        .first()

      if (existingFeedback) {
        return response.status(409).json({
          error: {
            code: 409,
            message: 'Conflict',
            details: 'Feedback already exists.',
          },
        })
      }

      const feedback = new FeedbackModel()

      feedback.user_uid = request.input('user_uid')
      feedback.text = request.input('text')
      feedback.screenshot = Attachment.fromFile(request.file('screenshot')!)

      await feedback.save()
      return response.status(201).send(feedback)
    } catch (error) {
      return response.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: `Error creating feedback: ${error.message}`,
        },
      })
    }
  }
}
