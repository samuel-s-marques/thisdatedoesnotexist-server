import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('chat_id').unsigned().references('chats.id').onDelete('CASCADE')
      table.boolean('reported').defaultTo(false)
      table.enum('status', ['sending', 'sent', 'read', 'failed']).defaultTo('sending')
      table.enum('type', ['text', 'image', 'video', 'audio', 'file']).defaultTo('text')
      table.text('content').notNullable()
      table.string('location')
      table.integer('duration')

      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
