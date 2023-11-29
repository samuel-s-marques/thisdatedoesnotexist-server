import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, ManyToMany, belongsTo, column, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Sex from './Sex'
import RelationshipGoal from './RelationshipGoal'
import PoliticalView from './PoliticalView'
import BodyType from './BodyType'
import User from './User'

export default class Preference extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public minAge: number

  @column()
  public maxAge: number

  @column()
  public userId: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @manyToMany(() => Sex, {
    pivotTable: 'preference_sexes',
    localKey: 'id',
    pivotForeignKey: 'preference_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'sex_id',
  })
  public sexes: ManyToMany<typeof Sex>

  @manyToMany(() => RelationshipGoal, {
    pivotTable: 'preference_relationship_goals',
    localKey: 'id',
    pivotForeignKey: 'preference_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'goal_id',
  })
  public relationshipGoals: ManyToMany<typeof RelationshipGoal>

  @manyToMany(() => PoliticalView, {
    pivotTable: 'preference_political_views',
    localKey: 'id',
    pivotForeignKey: 'preference_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'view_id',
  })
  public politicalViews: ManyToMany<typeof PoliticalView>

  @manyToMany(() => BodyType, {
    pivotTable: 'preference_body_types',
    localKey: 'id',
    pivotForeignKey: 'preference_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'body_type_id',
  })
  public bodyTypes: ManyToMany<typeof BodyType>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
