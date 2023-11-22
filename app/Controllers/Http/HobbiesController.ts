import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import HobbyModel from 'App/Models/HobbyModel'

export default class HobbiesController {
  public async index(ctx: HttpContextContract) {
    const page = ctx.request.input('page', 1)
    const query = ctx.request.input('query')
    const value = ctx.request.input('value')

    if (query && value) {
      const hobbies = await HobbyModel.query().where(query, value).paginate(page, 40)

      return hobbies
    }

    const hobbies = await HobbyModel.query().paginate(page, 40)
    return hobbies
  }

  public async show(ctx: HttpContextContract) {
    const hobby = await HobbyModel.query().where('id', ctx.params.id).firstOrFail()

    return hobby
  }
}
