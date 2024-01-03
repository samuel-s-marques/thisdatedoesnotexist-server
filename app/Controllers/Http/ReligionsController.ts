import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Religion from 'App/Models/Religion'
import CacheService from 'Service/CacheService'

export default class ReligionsController {
  public async index(ctx: HttpContextContract) {
    const cache = CacheService.getInstance()
    if (cache.get('religions')) {
      return cache.get('religions')
    }

    const page = ctx.request.input('page', 1)

    const religions = await Religion.query().paginate(page, 70)
    cache.set('religions', religions)

    return religions
  }

  public async show(ctx: HttpContextContract) {
    const religion = await Religion.query().where('id', ctx.params.id).firstOrFail()

    return religion
  }
}
