import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Occupation from 'App/Models/Occupation'
import CacheService from 'Service/CacheService'

export default class OccupationsController {
  public async index(ctx: HttpContextContract) {
    const cache = CacheService.getInstance()

    if (cache.get('occupations')) {
      return cache.get('occupations')
    }

    const page = ctx.request.input('page', 1)

    const occupations = await Occupation.query().paginate(page, 120)
    cache.set('occupations', occupations)

    return occupations
  }

  public async show(ctx: HttpContextContract) {
    const occupation = await Occupation.query().where('id', ctx.params.id).firstOrFail()

    return occupation
  }
}
