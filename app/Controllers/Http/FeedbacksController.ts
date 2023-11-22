import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import FeedbackModel from 'App/Models/FeedbackModel'

export default class FeedbacksController {
  public async index(ctx: HttpContextContract) {
    const page = ctx.request.input('page', 1)
    const query = ctx.request.input('query')
    const value = ctx.request.input('value')

    if (query && value) {
      const feedbacks = await FeedbackModel.query().where(query, value).paginate(page, 40)

      return feedbacks
    }

    const feedbacks = await FeedbackModel.query().paginate(page, 40)
    return feedbacks
  }

  public async show(ctx: HttpContextContract) {
    const feedback = await FeedbackModel.query().where('id', ctx.params.id).firstOrFail()

    return feedback
  }

  public async store(ctx: HttpContextContract) {
    const feedback = new FeedbackModel()
    feedback.user_uid = ctx.request.input('user_uid')
    feedback.text = ctx.request.input('text')
    feedback.screenshot = Attachment.fromFile(ctx.request.file('screenshot')!)

    await feedback.save()

    return feedback
  }
}
