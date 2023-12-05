import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'characters'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.uuid('uuid').notNullable()
      table.string('name').notNullable()
      table.string('nickname')
      table.string('surname').notNullable()
      table.integer('age')
      table.enum('sex', ['male', 'female'])
      table.string('relationship_goal')
      table.string('eye_color')
      table.string('hair_color')
      table.string('hair_style')
      table.string('religion')
      table.string('body_type')
      table.float('height')
      table.float('weight')
      table.string('skin_tone')
      table.string('birthplace')
      table.string('ethnicity')
      table.string('sexuality')
      table.string('occupation')
      table.string('phobia')
      table.string('social_class')
      table.string('political_view')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamps(true, true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
