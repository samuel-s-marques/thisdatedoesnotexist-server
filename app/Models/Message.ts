import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Chat from './Chat'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({columnName: 'user_id'})
  public user_id: number

  @column({columnName: 'chat_id'})
  public chat_id: number

  @column()
  public content: string

  @column()
  public reported: boolean

  @column()
  public type: string

  @column()
  public location: string

  @column()
  public status: string

  @belongsTo(() => User, { foreignKey: 'user_id' })
  public user: BelongsTo<typeof User>

  @belongsTo(() => Chat, { foreignKey: 'chat_id' })
  public chat: BelongsTo<typeof Chat>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
