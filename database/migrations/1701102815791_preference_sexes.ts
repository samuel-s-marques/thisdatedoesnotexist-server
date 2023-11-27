import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'preference_sexes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('sex_id').unsigned().references('sexes.id').onDelete('CASCADE')
      table.unique(['user_id', 'sex_id'])

      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
