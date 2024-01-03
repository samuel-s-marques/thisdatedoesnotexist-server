import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PoliticalView from 'App/Models/PoliticalView'
import CacheService from 'Service/CacheService'

export default class PoliticalViewsController {
  public async index(ctx: HttpContextContract) {
    const cache = CacheService.getInstance()
    if (cache.get('politicalViews')) {
      return cache.get('politicalViews')
    }
    
    const page = ctx.request.input('page', 1)
    const politicalViews = await PoliticalView.query().paginate(page, 70)
    cache.set('politicalViews', politicalViews)

    return politicalViews
  }

  public async show(ctx: HttpContextContract) {
    const politicalView = await PoliticalView.query().where('id', ctx.params.id).firstOrFail()

    return politicalView
  }
}
