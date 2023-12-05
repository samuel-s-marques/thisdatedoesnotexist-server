import { DateTime } from 'luxon'
import { BaseModel, ManyToMany, column, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import HobbyModel from './HobbyModel'
import PersonalityTraitModel from './PersonalityTraitModel'
import PronounsModel from './PronounsModel'
import RelationshipGoal from './RelationshipGoal'

export default class CharacterModel extends BaseModel {
  public static table = 'characters'

  @column({ isPrimary: true })
  public id: number

  @column()
  public uuid: string

  @column()
  public name: string

  @column()
  public nickname: string | null

  @column()
  public surname: string

  @column()
  public sex: string

  @column()
  public age: number

  @column()
  public hairColor: string

  @column()
  public eyeColor: string

  @column()
  public hairStyle: string

  @column()
  public religion: string

  @column()
  public relationshipGoal: string

  @column()
  public bodyType: string

  @column()
  public height: number

  @column()
  public weight: number

  @column()
  public skinTone: string

  @column()
  public birthplace: string

  @column()
  public ethnicity: string

  @column()
  public sexuality: string

  @column()
  public occupation: string

  @column()
  public phobia: string | null

  @column()
  public socialClass: string

  @column()
  public politicalView: string

  @manyToMany(() => HobbyModel, {
    pivotTable: 'character_hobby',
    localKey: 'id',
    pivotForeignKey: 'character_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'hobby_id',
  })
  public hobbies: ManyToMany<typeof HobbyModel>

  @manyToMany(() => PersonalityTraitModel, {
    pivotTable: 'character_personalitytrait',
    localKey: 'id',
    pivotForeignKey: 'character_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'trait_id',
  })
  public personalityTraits: ManyToMany<typeof PersonalityTraitModel>

  @manyToMany(() => PronounsModel, {
    pivotTable: 'character_pronoun',
    localKey: 'id',
    pivotForeignKey: 'character_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'pronoun_id',
  })
  public pronouns: ManyToMany<typeof PronounsModel>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
