import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BodyType from 'App/Models/BodyType'
import CacheService from 'Service/CacheService'

export default class BodyTypesController {
  public async index(ctx: HttpContextContract) {
    const cache = CacheService.getInstance()
    if (cache.get('bodyTypes')) {
      return cache.get('bodyTypes')
    }

    const page = ctx.request.input('page', 1)
    const bodyTypes = await BodyType.query().paginate(page, 70)
    cache.set('bodyTypes', bodyTypes)

    return bodyTypes
  }

  public async show(ctx: HttpContextContract) {
    const bodyType = await BodyType.query().where('id', ctx.params.id).firstOrFail()

    return bodyType
  }
}
