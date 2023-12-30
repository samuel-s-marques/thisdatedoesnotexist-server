import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'reports'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.enum('type', ['inappropriate content', 'bug', 'other'])
      table.enum('status', ['pending', 'resolved', 'rejected'])
      table.text('description').nullable()
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('character_id').unsigned().references('users.id').onDelete('CASCADE')

      table.timestamps(true, true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
