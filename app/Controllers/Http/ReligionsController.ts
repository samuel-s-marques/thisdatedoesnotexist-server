import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Religion from 'App/Models/Religion'

export default class ReligionsController {
  public async index(ctx: HttpContextContract) {
    const page = ctx.request.input('page', 1)

    const religions = await Religion.query().paginate(page, 70)
    return religions
  }

  public async show(ctx: HttpContextContract) {
    const religion = await Religion.query().where('id', ctx.params.id).firstOrFail()

    return religion
  }
}
