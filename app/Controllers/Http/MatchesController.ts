import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Match from 'App/Models/Match'

export default class MatchesController {
  public async index(ctx: HttpContextContract) {
    try {
      const page = ctx.request.input('page', 1)
      const searchQuery = ctx.request.qs()
      const uid = searchQuery.uid

      if (!uid) {
        return ctx.response.status(400).json({ error: 'User ID is required.' })
      }

      const matches = await Match.query()
        .where('user_id', uid)
        .paginate(page, 40)

      return matches
    } catch (error) {
      return ctx.response.status(400).json({ error: error.message })
    }
  }
}
