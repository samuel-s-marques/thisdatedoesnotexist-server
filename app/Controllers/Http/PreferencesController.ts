import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Preference from 'App/Models/Preference'
import User from 'App/Models/User'
import CacheService from 'Service/CacheService'

export default class PreferencesController {
  public async show({ request, response }: HttpContextContract) {
    try {
      const uid = request.token.uid
      const user = await User.findByOrFail('uid', uid)

      const cache = CacheService.getInstance()
      if (cache.get(`preferences-${uid}`)) {
        return cache.get(`preferences-${uid}`)
      }

      const preference = await Preference.query()
        .where('user_id', user.id)
        .preload('body_types')
        .preload('political_views')
        .preload('relationship_goals')
        .preload('sexes')
        .preload('religions')
        .firstOrFail()

      cache.set(`preferences-${uid}`, preference)

      return preference
    } catch (error) {
      return response.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: `Error getting preferences: ${error.message}`,
        },
      })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    try {
      const uid = request.token.uid
      const existingPreference = await Preference.query().where('user_id', uid).first()

      if (existingPreference) {
        return response.status(409).json({
          error: {
            code: 409,
            message: 'Conflict',
            details: 'Preference already exists.',
          },
        })
      }

      const preference = await Preference.create(request.body())

      const cache = CacheService.getInstance()
      cache.set(`preferences-${uid}`, preference)

      return response.status(201).send(preference)
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

  public async update({ request, response }: HttpContextContract) {
    try {
      const uid = request.token.uid
      const requestData = request.only([
        'min_age',
        'max_age',
        'relationship_goals',
        'sexes',
        'body_types',
        'political_views',
        'religions',
      ])
      const user = await User.findByOrFail('uid', uid)
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

      if (requestData.religions) {
        await preference
          .related('religions')
          .sync(requestData.religions.map((religion: { id: number; name: string }) => religion.id))
      }

      const updatedPreference = await Preference.query()
        .where('user_id', user.id)
        .preload('body_types')
        .preload('political_views')
        .preload('relationship_goals')
        .preload('sexes')
        .preload('religions')
        .firstOrFail()

      const cache = CacheService.getInstance()
      cache.set(`preferences-${user.uid}`, updatedPreference)

      return response.status(201).send(updatedPreference)
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
