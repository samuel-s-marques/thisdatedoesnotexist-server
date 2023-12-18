import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Swipe from 'App/Models/Swipe'
import Application from '@ioc:Adonis/Core/Application'
import * as OneSignal from '@onesignal/node-onesignal'
import Env from '@ioc:Adonis/Core/Env'
import User from 'App/Models/User'
import notificationsJson from '../../../assets/json/notifications.json'
import Logger from '@ioc:Adonis/Core/Logger'
import Chat from 'App/Models/Chat'

declare global {
  interface String {
    isUUID(): boolean
  }
}

String.prototype.isUUID = function (): boolean {
  const uuidRegex: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(this)
}

export default class SwipesController {
  oneSignal = Application.container.use('Adonis/Addons/OneSignal')
  oneSignalAppId = Env.get('ONESIGNAL_APP_ID')

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

      const isCharacter: boolean = swiper.uid.isUUID()

      const reciprocalSwipe = await Swipe.query()
        .where('target_id', swiper.id)
        .where('swiper_id', target.id)
        .where('direction', 'right')
        .first()

      if (isCharacter && !reciprocalSwipe) {
        this.sendNotification('like', target.uid, swiper.name)
        return
      }

      if (reciprocalSwipe) {
        await Chat.create({
          user_id: isCharacter ? target.id : swiper.id,
          character_id: isCharacter ? swiper.id : target.id,
        })

        if (isCharacter) {
          this.sendNotification('match', target.uid, swiper.name)
        }

        return
      }

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

  private sendNotification(type: string, userUid: string, characterName: string) {
    const notification = new OneSignal.Notification()
    notification.app_id = this.oneSignalAppId
    notification.headings = {
      en: this.getRandomNotification('en', type)!.title,
      pt: this.getRandomNotification('pt', type)!.title,
    }
    notification.contents = {
      en: this.getRandomNotification('en', type)!.content.replace('[name]', characterName),
    }
    notification.include_external_user_ids = [userUid]

    this.oneSignal.createNotification(notification)
  }

  private getRandomElement(array: any[]) {
    const randomIndex = Math.floor(Math.random() * array.length)
    return array[randomIndex]
  }

  private getRandomNotification(language: string, type: string) {
    const languageData = notificationsJson[language]

    if (!languageData) {
      Logger.error(`Language ${language} not found.`)
      return null
    }

    const typeData = languageData[type]

    if (!typeData) {
      Logger.error(`Type ${type} not found for language ${language}.`)
      return null
    }

    const titles = typeData.titles
    const contents = typeData.contents

    if (!titles || !contents) {
      Logger.error(`Titles or contents not found for type ${type} in language ${language}.`)
      return null
    }

    const title = this.getRandomElement(titles)
    const content = this.getRandomElement(contents)

    return {
      title,
      content,
    }
  }
}
