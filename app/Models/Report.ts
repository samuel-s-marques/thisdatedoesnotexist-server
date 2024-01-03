import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Report extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public description: string

  @column({columnName: 'user_id'})
  public user_id: number

  @column({columnName: 'character_id'})
  public character_id: number

  @column()
  public type: string

  @column()
  public status: string

  @belongsTo(() => User, { foreignKey: 'user_id' })
  public user: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'character_id' })
  public character: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
