import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PronounsModel from 'App/Models/PronounsModel'

export default class PronounsController {
  public async index(ctx: HttpContextContract) {
    const page = ctx.request.input('page', 1)
    const query = ctx.request.input('query')
    const value = ctx.request.input('value')

    if (query && value) {
      const pronouns = await PronounsModel.query().where(query, value).paginate(page, 40)

      return pronouns
    }

    const pronouns = await PronounsModel.query().paginate(page, 40)
    return pronouns
  }

  public async show(ctx: HttpContextContract) {
    const pronoun = await PronounsModel.query().where('id', ctx.params.id).firstOrFail()

    return pronoun
  }
}
