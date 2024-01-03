import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Sex from 'App/Models/Sex'
import CacheService from 'Service/CacheService'

export default class SexesController {
  public async index(ctx: HttpContextContract) {
    const cache = CacheService.getInstance()
    if (cache.get('sexes')) {
      return cache.get('sexes')
    }
    
    const page = ctx.request.input('page', 1)
    const sexes = await Sex.query().paginate(page, 70)
    cache.set('sexes', sexes)
    
    return sexes
  }

  public async show(ctx: HttpContextContract) {
    const sex = await Sex.query().where('id', ctx.params.id).firstOrFail()

    return sex
  }
}
