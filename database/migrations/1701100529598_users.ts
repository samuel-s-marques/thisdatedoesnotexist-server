import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uid').notNullable()
      table.string('email').notNullable()
      table.string('name')
      table.string('nickname')
      table.string('surname')
      table.integer('age')
      table.dateTime('birthday')
      table.string('sex')
      table.text('bio')
      table.integer('pronoun_id').unsigned().references('pronouns.id').onDelete('SET NULL')
      table.integer('occupation_id').unsigned().references('occupations.id').onDelete('SET NULL')
      table
        .integer('relationship_goal_id')
        .unsigned()
        .references('relationship_goals.id')
        .onDelete('SET NULL')
      table.string('religion')
      table.string('country')
      table.string('image_url')
      table.double('height')
      table.double('weight')
      table.string('eye_color')
      table.string('hair_color')
      table.string('hair_style')
      table.string('body_type')
      table.string('skin_tone')
      table.string('ethnicity')
      table.string('sexuality')
      table.string('phobia')
      table.string('social_class')
      table.string('political_view')
      table.enum('status', ['normal', 'banned', 'suspended'])
      table.enum('type', ['user', 'character'])
      table.timestamp('last_swipe').nullable()
      table.integer('available_swipes').defaultTo(20)
      table.integer('reports_count').defaultTo(0)
      table.string('status_reason').nullable()
      table.boolean('active').defaultTo(false)
      table.dateTime('status_until').nullable()

      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
