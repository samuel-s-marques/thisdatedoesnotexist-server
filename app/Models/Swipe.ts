import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Swipe extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({
    columnName: 'target_id',
  })
  public target_id: number

  @column({
    columnName: 'swiper_id',
  })
  public swiper_id: number

  @belongsTo(() => User, {
    foreignKey: 'target_id',
    localKey: 'id',
  })
  public target: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'swiper_id',
    localKey: 'id',
  })
  public swiper: BelongsTo<typeof User>

  @column()
  public direction: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
