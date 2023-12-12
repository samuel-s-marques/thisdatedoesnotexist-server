import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'swipes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('swiper_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('target_id').unsigned().references('users.id').onDelete('CASCADE')
      table.enum('direction', ['left', 'right']).notNullable()

      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
