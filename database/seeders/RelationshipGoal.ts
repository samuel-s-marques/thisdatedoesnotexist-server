import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import RelationshipGoal from 'App/Models/RelationshipGoal'

export default class extends BaseSeeder {
  public async run() {
    await RelationshipGoal.createMany([
      {
        name: 'Dating',
      },
      {
        name: 'Friendship',
      },
      {
        name: 'Serious Relationship',
      },
      {
        name: 'Networking',
      },
      {
        name: 'Open Relationship',
      },
      {
        name: 'Open to Options',
      },
      {
        name: 'Casual',
      },
      {
        name: 'Exploration',
      },
    ])
  }
}
