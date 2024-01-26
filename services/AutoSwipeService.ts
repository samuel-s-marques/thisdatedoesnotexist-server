import Logger from '@ioc:Adonis/Core/Logger'
import Swipe from 'App/Models/Swipe'
import User from 'App/Models/User'
import { AxiosResponse } from 'axios'
import NotificationService from './NotificationService'
import Chat from 'App/Models/Chat'
import ProfileSuggesterService from './ProfileSuggesterService'

const notificationService: NotificationService = new NotificationService()
const profileSuggesterService: ProfileSuggesterService = new ProfileSuggesterService()

export default class AutoSwipeService {
  private static instance: AutoSwipeService

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
        .where('status', 'normal')
        .whereNotIn('id', (query) => {
          query
            .select('swiper_id')
            .from('swipes')
            .where('target_id', user_id)
            .where('direction', 'right')
            .orWhere('direction', 'left')
        }).whereNotIn('id', (query) => {
          query.select('character_id').from('chats').where('user_id', user_id)
        })

      return characters
    } catch (error) {
      console.log(error)
      Logger.error('Error getting character profiles from Database: ', error)
      return []
    }
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
          const response = await profileSuggesterService.getProfilesFromApi(user, charactersJson)
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
          profile_index < Math.min(20, suggestedProfiles.length);
          profile_index++
        ) {
          const { id, score } = suggestedProfiles[profile_index]
          const character: User = await User.findByOrFail('id', id)

          const swipeExists = await Swipe.query()
            .where('swiper_id', character.id)
            .where('target_id', user.id)
            .first()
          if (swipeExists) {
            Logger.info(`Swipe from ${character.id} to ${user.id} already exists. Skipping.`)
            continue
          }

          const randomScoreThreshold = 0.1
          let direction = score > randomScoreThreshold ? 'right' : 'left'

          const reciprocalSwipe = await Swipe.query()
            .where('target_id', id)
            .where('swiper_id', user.id)
            .where('direction', 'right')
            .first()

          if (reciprocalSwipe && direction === 'right') {
            await Chat.firstOrCreate({
              user_id: user.id,
              character_id: id,
            })

            await notificationService.sendNotification('match', user.uid, character)
            Logger.info(
              `${character.name} (${character.uid}) and ${user.name} (${user.uid}) matched.`
            )
            continue
          }

          const swipe = new Swipe()

          swipe.direction = direction
          await swipe.related('swiper').associate(character)
          await swipe.related('target').associate(user)
          await swipe.save()

          if (swipe.direction === 'right') {
            await notificationService.sendNotification('like', user.uid, character)
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
