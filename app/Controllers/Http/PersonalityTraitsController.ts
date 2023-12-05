import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PersonalityTraitModel from 'App/Models/PersonalityTraitModel'

export default class PersonalityTraitsController {
  public async index(ctx: HttpContextContract) {
    const page = ctx.request.input('page', 1)
    const query = ctx.request.input('query')
    const value = ctx.request.input('value')

    if (query && value) {
      const traits = await PersonalityTraitModel.query().where(query, value).paginate(page, 40)

      return traits
    }

    const traits = await PersonalityTraitModel.query().paginate(page, 40)
    return traits
  }

  public async show(ctx: HttpContextContract) {
    const trait = await PersonalityTraitModel.query().where('id', ctx.params.id).firstOrFail()

    return trait
  }
}
