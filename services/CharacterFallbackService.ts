import Logger from '@ioc:Adonis/Core/Logger'
import User from 'App/Models/User'
import Drive from '@ioc:Adonis/Core/Drive'
export default class CharacterFallbackService {
  private static instance: CharacterFallbackService

  public static getInstance(): CharacterFallbackService {
    if (!CharacterFallbackService.instance) {
      CharacterFallbackService.instance = new CharacterFallbackService()
    }

    return CharacterFallbackService.instance
  }

  public async checkCharacters() {
    try {
      const characters: User[] = await User.query().where('type', 'character')

      if (characters.length === 0) {
        Logger.info('No characters found')
        return
      }

      let characterLength = characters.length
      for (let i = 0; i < characterLength; i++) {
        const character: User = characters[i]
        const fileExists = await Drive.exists(`characters/${character.uid}.png`)

        if (fileExists) {
          if (character.bio == null || character.bio == undefined) {
            Logger.info(`Character ${character.uid} does not have a bio. Deleting...`)
            await character.delete()
            continue
          }

          continue
        }

        Logger.info(`Character ${character.uid} does not have a profile picture. Deleting...`)
        await Drive.delete(`characters/${character.uid}.png`)
        await character.delete()
      }
    } catch (error) {
      Logger.error(error, 'Error checking characters.')
    }
  }
}
