import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uid').notNullable()
      table.string('email').notNullable()
      table.string('name')
      table.string('surname')
      table.integer('age')
      table.string('sex')
      table.text('bio')
      table.string('relationship_goal')
      table.string('religion')
      table.string('country')
      table.string('image_url')
      table.string('political_view')
      table.double('height')
      table.double('weight')
      table.timestamp('last_swipe').nullable()
      table.timestamp('birthday_date').nullable()
      table.integer('swipes').defaultTo(20)
      table.boolean('active').defaultTo(false)
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
