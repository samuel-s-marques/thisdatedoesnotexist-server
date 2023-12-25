import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Swipe from 'App/Models/Swipe'
import User from 'App/Models/User'

export default class SwipesController {
  public async store({ request, response }: HttpContextContract) {
    try {
      const { target_id, swiper_id, direction } = request.all()

      const swiper = await User.query().where('uid', swiper_id).firstOrFail()
      const target = await User.query().where('uid', target_id).firstOrFail()

      const existingSwipe = await Swipe.query()
        .where('target_id', target.id)
        .andWhere('swiper_id', swiper.id)
        .first()

      if (existingSwipe) {
        return response.status(400).json({ error: 'Swipe already exists.' })
      }

      const swipe = new Swipe()

      swipe.direction = direction
      await swipe.related('swiper').associate(swiper)
      await swipe.related('target').associate(target)

      await swipe.save()

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

      const user = await User.query().where('uid', uid).firstOrFail()
      const swipes = await Swipe.query()
        .preload('target')
        .where('swiper_id', user.id)
        .if(searchQuery.direction, (query) => {
          query.where('direction', searchQuery.direction)
        })
        .paginate(page, 40)

      return swipes
    } catch (error) {
      return ctx.response.status(400).json({ error: error.message })
    }
  }
}
