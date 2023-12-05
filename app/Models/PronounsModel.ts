import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class PronounsModel extends BaseModel {
  public static table = 'pronouns'

  @column({ isPrimary: true })
  public id: number

  @column()
  public type: string

  @column()
  public subjectPronoun: string

  @column()
  public objectPronoun: string

  @column()
  public possessiveAdjective: string

  @column()
  public possessivePronoun: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
