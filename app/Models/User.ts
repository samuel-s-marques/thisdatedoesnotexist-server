import { DateTime } from 'luxon'
import { BaseModel, HasOne, ManyToMany, column, hasOne, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Preference from './Preference'
import HobbyModel from './HobbyModel'

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
  public relationship_goal: string

  @column()
  public religion: string

  @column()
  public country: string

  @column()
  public image_url: string

  @column()
  public political_view: string

  @column()
  public height: number

  @column()
  public weight: number

  @column.dateTime()
  public last_swipe: DateTime | null

  @column.dateTime()
  public birthday_date: DateTime | null

  @column()
  public swipes: number

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

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
