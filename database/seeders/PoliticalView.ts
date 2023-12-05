import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import PoliticalView from 'App/Models/PoliticalView'

export default class extends BaseSeeder {
  public async run() {
    await PoliticalView.createMany([
      {
        name: 'far left',
      },
      {
        name: 'left',
      },
      {
        name: 'center-left',
      },
      {
        name: 'center',
      },
      {
        name: 'center-right',
      },
      {
        name: 'right',
      },
      {
        name: 'far right',
      },
    ])
  }
}
