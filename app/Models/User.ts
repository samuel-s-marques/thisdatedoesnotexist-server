import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  HasOne,
  ManyToMany,
  belongsTo,
  column,
  hasOne,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Preference from './Preference'
import HobbyModel from './HobbyModel'
import PersonalityTraitModel from './PersonalityTraitModel'
import RelationshipGoal from './RelationshipGoal'
import PronounsModel from './PronounsModel'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public uid: string

  @column()
  public email: string

  @column()
  public name: string

  @column()
  public nickname: string | null

  @column()
  public surname: string

  @column()
  public age: number

  @column()
  public sex: string

  @column()
  public bio: string

  @column()
  public occupation: string

  @column()
  public religion: string

  @column()
  public country: string

  @column()
  public imageUrl: string

  @column()
  public politicalView: string

  @column()
  public phobia: string | null

  @column()
  public socialClass: string

  @column()
  public height: number

  @column()
  public weight: number

  @column()
  public hairColor: string

  @column()
  public eyeColor: string

  @column()
  public hairStyle: string

  @column()
  public bodyType: string

  @column()
  public skinTone: string

  @column()
  public birthplace: string

  @column()
  public ethnicity: string

  @column()
  public sexuality: string

  @column.dateTime()
  public lastSwipe: DateTime | null

  @column.dateTime()
  public birthdate: DateTime | null

  @column()
  public swipes: number

  @column()
  public type: string

  @column()
  public active: boolean

  @hasOne(() => Preference)
  public preferences: HasOne<typeof Preference>

  @manyToMany(() => HobbyModel, {
    pivotTable: 'user_hobby',
    localKey: 'id',
    pivotForeignKey: 'user_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'hobby_id',
  })
  public hobbies: ManyToMany<typeof HobbyModel>

  @manyToMany(() => PersonalityTraitModel, {
    pivotTable: 'user_personalitytrait',
    localKey: 'id',
    pivotForeignKey: 'user_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'trait_id',
  })
  public personalityTraits: ManyToMany<typeof PersonalityTraitModel>

  @column()
  public relationship_goal_id: number

  @belongsTo(() => RelationshipGoal, {
    foreignKey: 'relationship_goal_id',
    localKey: 'id',
  })
  public relationshipGoal: BelongsTo<typeof RelationshipGoal>

  @column()
  public pronoun_id: number

  @belongsTo(() => PronounsModel, {
    foreignKey: 'pronoun_id',
    localKey: 'id',
  })
  public pronoun: BelongsTo<typeof PronounsModel>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
