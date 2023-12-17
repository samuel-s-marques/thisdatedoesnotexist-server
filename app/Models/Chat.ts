import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, HasMany, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Message from './Message'

export default class Chat extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'user_id' })
  public userId: number

  @column({ columnName: 'character_id' })
  public characterId: number

  @belongsTo(() => User, { foreignKey: 'user_id' })
  public user: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'character_id' })
  public character: BelongsTo<typeof User>

  @hasMany(() => Message, { foreignKey: 'chat_id' })
  public messages: HasMany<typeof Message>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
