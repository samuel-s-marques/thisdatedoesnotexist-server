import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'preference_relationship_goals'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('preference_id').unsigned().references('preferences.id').onDelete('CASCADE')
      table
        .integer('goal_id')
        .unsigned()
        .references('relationship_goals.id')
        .onDelete('CASCADE')
      table.unique(['preference_id', 'goal_id'])

      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
