import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BodyType from 'App/Models/BodyType'

export default class BodyTypesController {
  public async index(ctx: HttpContextContract) {
    const page = ctx.request.input('page', 1)
    const searchQuery = ctx.request.qs()

    const bodyTypes = await BodyType.query()
      .if(searchQuery.sex, (query) => {
        query.where('sex', searchQuery.sex)
      })
      .paginate(page, 70)
    return bodyTypes
  }

  public async show(ctx: HttpContextContract) {
    const bodyType = await BodyType.query().where('id', ctx.params.id).firstOrFail()

    return bodyType
  }
}
