import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Swipe extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public targetId: number

  @column()
  public swiperId: number

  @column()
  public direction: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
