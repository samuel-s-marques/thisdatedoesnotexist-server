import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Sex from 'App/Models/Sex'

export default class extends BaseSeeder {
  public async run() {
    await Sex.createMany([
      {
        name: 'male'
      },
      {
        name: 'female'
      }
    ])
  }
}
