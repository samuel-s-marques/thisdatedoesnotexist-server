import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Preference from 'App/Models/Preference'
import User from 'App/Models/User'

export default class PreferencesController {
  public async show(ctx: HttpContextContract) {
    const user = await User.findByOrFail('uid', ctx.params.id)
    const preference = await Preference.query()
      .where('user_id', user.id)
      .preload('body_types')
      .preload('political_views')
      .preload('relationship_goals')
      .preload('sexes')
      .firstOrFail()

    return preference
  }

  public async store(ctx: HttpContextContract) {
    const preference = await Preference.create(ctx.request.body())

    return preference
  }

  public async update({ request, params }: HttpContextContract) {
    const requestData = request.only([
      'min_age',
      'max_age',
      'relationship_goals',
      'sexes',
      'body_types',
      'political_views',
    ])
    const user = await User.findByOrFail('uid', params.id)
    const preference = await Preference.query().where('user_id', user.id).firstOrFail()

    preference.merge(request.body())
    await preference.save()

    if (requestData.relationship_goals) {
      await preference
        .related('relationship_goals')
        .sync(requestData.relationship_goals.map((sex: { id: number; name: string }) => sex.id))
    }

    if (requestData.sexes) {
      await preference
        .related('sexes')
        .sync(requestData.sexes.map((sex: { id: number; name: string }) => sex.id))
    }

    if (requestData.body_types) {
      await preference
        .related('body_types')
        .sync(requestData.body_types.map((bodyType: { id: number; name: string }) => bodyType.id))
    }

    if (requestData.political_views) {
      await preference
        .related('political_views')
        .sync(requestData.political_views.map((view: { id: number; name: string }) => view.id))
    }

    return preference
  }
}