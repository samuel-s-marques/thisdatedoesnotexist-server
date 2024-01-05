import Logger from '@ioc:Adonis/Core/Logger'
import User from 'App/Models/User'
import { DateTime } from 'luxon'

export default class SuspensionService {
  private static instance: SuspensionService

  public static getInstance(): SuspensionService {
    if (!SuspensionService.instance) {
      SuspensionService.instance = new SuspensionService()
    }

    return SuspensionService.instance
  }

  public async checkSuspensions() {
    try {
      const users: User[] = await User.query()
        .where('status', 'suspended')
        .andWhereNotNull('status_until')

      if (users.length === 0) {
        Logger.info('No suspended users found')
        return
      }

      let userLength = users.length
      for (let i = 0; i < userLength; i++) {
        const user: User = users[i]
        const now = DateTime.now()

        if (now < user.statusUntil!) {
          continue
        }

        Logger.info(`User ${user.uid} has been unsuspended.`)
        user.status = 'normal'
        user.statusReason = null
        user.statusUntil = null
        await user.save()
      }
    } catch (error) {
      Logger.error('Error checking suspensions: ', error)
    }
  }
}
