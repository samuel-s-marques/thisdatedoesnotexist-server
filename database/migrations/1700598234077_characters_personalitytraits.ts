import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'character_personalitytrait'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('character_id').unsigned().references('characters.id').onDelete('CASCADE')
      table.integer('trait_id').unsigned().references('personality_traits.id').onDelete('CASCADE')
      table.unique(['character_id', 'trait_id'])

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
