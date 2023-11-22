import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RelationshipGoal from 'App/Models/RelationshipGoal'

export default class RelationshipGoalsController {
  public async index(ctx: HttpContextContract) {
    const page = ctx.request.input('page', 1)
    const query = ctx.request.input('query')
    const value = ctx.request.input('value')

    if (query && value) {
      const relationshipGoals = await RelationshipGoal.query()
        .where(query, value)
        .paginate(page, 20)

      return relationshipGoals
    }

    const relationshipGoals = await RelationshipGoal.query().paginate(page, 20)
    return relationshipGoals
  }

  public async show(ctx: HttpContextContract) {
    const relationshipGoal = await RelationshipGoal.query().where('id', ctx.params.id).firstOrFail()

    return relationshipGoal
  }
}
