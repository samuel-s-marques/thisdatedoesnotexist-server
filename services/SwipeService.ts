import { Timestamp } from 'firebase-admin/firestore'
import Logger from '@ioc:Adonis/Core/Logger'
import User from 'App/Models/User'

class SwipeService {
  private static instance: SwipeService

  public static getInstance(): SwipeService {
    if (!SwipeService.instance) {
      SwipeService.instance = new SwipeService()
    }

    return SwipeService.instance
  }

  public async checkSwipes() {
    try {
      const now = Timestamp.now()
      // TODO: Change this to 24 hours
      let time = now.toMillis() - 5 * 60 * 1000
      const users = await User.query().where('type', 'user').andWhere('last_swipe', '<', new Date(time))

      if (users.length === 0) {
        Logger.info('No users with swipes under 20 found.')
        return
      }

      for (const user of users) {
        Logger.warn(`User ${user.uid} has swipes under 20.`)

        user.availableSwipes = 20
        user.lastSwipe = null
        await user.save()
      }

      await Promise.all(
        users.map(async (user) => {
          user.availableSwipes = 20
          user.lastSwipe = null
          await user.save()
        })
      )

      Logger.info('Swipes updated successfully.')
    } catch (error) {
      Logger.error(error, 'Error checking swipes: ')
    }
  }
}

export default SwipeService
