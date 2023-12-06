import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Occupation from 'App/Models/Occupation'

export default class OccupationsController {
  public async index(ctx: HttpContextContract) {
    const page = ctx.request.input('page', 1)

    const occupations = await Occupation.query().paginate(page, 120)
    return occupations
  }

  public async show(ctx: HttpContextContract) {
    const occupation = await Occupation.query().where('id', ctx.params.id).firstOrFail()

    return occupation
  }
}
