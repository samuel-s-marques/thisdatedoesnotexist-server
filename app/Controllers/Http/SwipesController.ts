import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Swipe from 'App/Models/Swipe'

export default class SwipesController {
  public async store({ request, response }: HttpContextContract) {
    try {
      const { targetId, swiperId, direction } = request.all()

      const swipe = await Swipe.create({
        targetId,
        swiperId,
        direction,
      })

      return swipe
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  public async index(ctx: HttpContextContract) {
    try {
      const page = ctx.request.input('page', 1)
      const searchQuery = ctx.request.qs()
      const uid = searchQuery.uid

      if (!uid) {
        return ctx.response.status(400).json({ error: 'User ID is required.' })
      }

      const swipes = await Swipe.query()
        .where('swiper_id', uid)
        .if(searchQuery.direction, (query) => {
          query.whereIn('direction', searchQuery.direction)
        })
        .paginate(page, 40)

      return swipes
    } catch (error) {
      return ctx.response.status(400).json({ error: error.message })
    }
  }
}
