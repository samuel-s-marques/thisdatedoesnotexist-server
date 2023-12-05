import { DateTime } from 'luxon'
import { BaseModel, ManyToMany, column, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import CharacterModel from './CharacterModel'

export default class PersonalityTraitModel extends BaseModel {
  public static table = 'personality_traits'

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public type: string

  @manyToMany(() => CharacterModel, {
    pivotTable: 'character_personalitytrait',
  })
  public personalityTraits: ManyToMany<typeof CharacterModel>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
