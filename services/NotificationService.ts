import * as OneSignal from '@onesignal/node-onesignal'
import Env from '@ioc:Adonis/Core/Env'
import Application from '@ioc:Adonis/Core/Application'
import Logger from '@ioc:Adonis/Core/Logger'
import notificationsJson from '../assets/json/notifications.json'
import Notification from 'App/Models/Notification'
import User from 'App/Models/User'

export default class NotificationService {
  private static instance: NotificationService
  private readonly oneSignalAppId = Env.get('ONESIGNAL_APP_ID')
  private oneSignal: OneSignal.DefaultApi = Application.container.use('Adonis/Addons/OneSignal')

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }

    return NotificationService.instance
  }

  public async sendNotification(type: string, userUid: string, character?: User) {
    const heading = this.getRandomNotification('en', type)!.title
    const content = this.getRandomNotification('en', type)!.content

    if (character) {
      heading.replace('[name]', character.name)
      content.replace('[name]', character.name)
    }

    const notification = new OneSignal.Notification()
    notification.app_id = this.oneSignalAppId
    notification.headings = {
      en: heading,
    }
    notification.contents = {
      en: content,
    }
    notification.include_external_user_ids = [userUid]

    this.oneSignal.createNotification(notification)
    const user: User = await User.findByOrFail('uid', userUid)

    const createdNotification = new Notification()
    await createdNotification.related('user').associate(user)
    createdNotification.title = notification.headings.en!
    createdNotification.subtitle = notification.contents.en!
    createdNotification.type = type

    if (character) {
      createdNotification.image = `characters/${character.uid}.png`
    }

    await createdNotification.save()
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
