import { DateTime } from 'luxon'
import { BaseModel, ManyToMany, column, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import CharacterModel from './CharacterModel'

export default class HobbyModel extends BaseModel {
  public static table = 'hobbies'

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public type: string

  @manyToMany(() => CharacterModel, {
    pivotTable: 'character_hobby',
  })
  public personalityTraits: ManyToMany<typeof CharacterModel>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
