import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Sex from 'App/Models/Sex'

export default class SexesController {
  public async index(ctx: HttpContextContract) {
    const page = ctx.request.input('page', 1)

    const sexes = await Sex.query().paginate(page, 70)
    return sexes
  }

  public async show(ctx: HttpContextContract) {
    const sex = await Sex.query().where('id', ctx.params.id).firstOrFail()

    return sex
  }
}