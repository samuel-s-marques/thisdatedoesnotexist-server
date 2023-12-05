import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { AttachmentContract, attachment } from '@ioc:Adonis/Addons/AttachmentLite'

export default class FeedbackModel extends BaseModel {
  public static table = 'feedbacks'

  @column({ isPrimary: true })
  public id: number

  @column()
  public user_uid: string

  @column()
  public text: string

  @attachment()
  public screenshot: AttachmentContract

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
