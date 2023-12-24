import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import Swipe from 'App/Models/Swipe'
import User from 'App/Models/User'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import NotificationService from './NotificationService'

const notificationService: NotificationService = new NotificationService()

export default class AutoSwipeService {
  private static instance: AutoSwipeService
  private static readonly API_URL = Env.get('PROFILE_SUGGESTER_API_URL')

  public static getInstance(): AutoSwipeService {
    if (!AutoSwipeService.instance) {
      AutoSwipeService.instance = new AutoSwipeService()
    }

    return AutoSwipeService.instance
  }

  private async getUserProfilesFromDatabase(): Promise<User[]> {
    try {
      const users: User[] = await User.query()
        .where('type', 'user')
        .preload('hobbies')
        .preload('relationshipGoal')

      return users
    } catch (error) {
      Logger.error('Error getting user profiles from Database: ', error)
      return []
    }
  }

  private async getCharacterProfilesFromDatabase(user_id: number): Promise<User[]> {
    try {
      const characters: User[] = await User.query()
        .where('type', 'character')
        .preload('hobbies')
        .preload('relationshipGoal')
        .whereNotIn('id', (query) => {
          query
            .select('swiper_id')
            .from('swipes')
            .where('target_id', user_id)
            .where('direction', 'right')
            .where('direction', 'left')
        })

      return characters
    } catch (error) {
      console.log(error)
      Logger.error('Error getting character profiles from Database: ', error)
      return []
    }
  }

  private async makeApiRequest(user: User, profilesJson: any) {
    const requestOptions: AxiosRequestConfig = {
      method: 'POST',
      url: `${AutoSwipeService.API_URL}/find-similar-profiles`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        user: user,
        profiles: profilesJson,
      },
    }

    return await axios(requestOptions)
  }

  public async swipeProfiles() {
    try {
      const users: User[] = await this.getUserProfilesFromDatabase()

      if (users.length === 0) {
        Logger.error('No users found in database.')
        return
      }

      const responses = await Promise.all(
        users.map(async (user) => {
          const characters: User[] = await this.getCharacterProfilesFromDatabase(user.id)

          if (characters.length === 0) {
            Logger.error(`No characters found in database for user ${user.name}.`)
            return
          }

          const charactersJson = characters.map((character) => character.toJSON())
          const response = await this.makeApiRequest(user, charactersJson)
          return { user, response }
        })
      )

      const validResponses = responses.filter(
        (response): response is { user: User; response: AxiosResponse } => response !== undefined
      )

      for (const { user, response } of validResponses) {
        Logger.info('Got response from Profile Suggester API.')
        const suggestedProfiles = response.data.suggested_profiles

        if (!suggestedProfiles || suggestedProfiles.length === 0) {
          Logger.info('No suggested profiles found.')
          continue
        }

        Logger.info('Profiles found.')

        for (
          let profile_index = 0;
          profile_index < Math.min(10, suggestedProfiles.length);
          profile_index++
        ) {
          const { id, score } = suggestedProfiles[profile_index]

          const swipeExists = await Swipe.query()
            .where('swiper_id', id)
            .where('target_id', user.id)
            .first()
          if (swipeExists) {
            Logger.info(`Swipe from ${id} to ${user.id} already exists. Skipping.`)
            continue
          }

          const character: User = await User.findByOrFail('id', id)
          const swipe = new Swipe()
          const randomScoreThreshold = 0.4 + Math.random() * 0.2

          swipe.direction = score > randomScoreThreshold ? 'right' : 'left'
          await swipe.related('swiper').associate(character)
          await swipe.related('target').associate(user)
          await swipe.save()

          if (swipe.direction === 'right') {
            notificationService.sendNotification('like', user.uid, character.name)
          }
          Logger.info(
            `${character.name} (${character.uid}) swiped ${swipe.direction} on ${user.name}. Their score: ${score}`
          )
        }
      }
    } catch (error) {
      console.log(error)
      Logger.error('Error liking profiles: ', error)
    }
  }
}
