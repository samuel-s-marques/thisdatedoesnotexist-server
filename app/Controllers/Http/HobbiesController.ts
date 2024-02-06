import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import HobbyModel from 'App/Models/HobbyModel'
import CacheService from 'Service/CacheService'

export default class HobbiesController {
  public async index(ctx: HttpContextContract) {
    const cache = CacheService.getInstance()

    if (cache.get('hobbies')) {
      return cache.get('hobbies')
    }

    const page = ctx.request.input('page', 1)
    const hobbies = await HobbyModel.query().paginate(page, 120)
    cache.set('hobbies', hobbies)

    return hobbies
  }

  public async show(ctx: HttpContextContract) {
    const hobby = await HobbyModel.query().where('id', ctx.params.id).firstOrFail()

    return hobby
  }
}
