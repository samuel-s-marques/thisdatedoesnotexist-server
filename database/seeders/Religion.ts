import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Religion from 'App/Models/Religion'

export default class extends BaseSeeder {
  public async run() {
    await Religion.createMany([
      { name: 'islam' },
      { name: 'atheism' },
      { name: 'buddhism' },
      { name: 'shia islam' },
      { name: 'animism/indigenous' },
      { name: 'hinduism' },
      { name: 'sikhism' },
      { name: 'judaism' },
      { name: 'sunni islam' },
      { name: 'confuciannism' },
      { name: 'zoroastrianism' },
      { name: 'taoism' },
      { name: 'jewish' },
      { name: 'christianity' },
      { name: 'shinto' },
    ])
  }
}
