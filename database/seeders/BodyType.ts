import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import BodyType from 'App/Models/BodyType'

export default class extends BaseSeeder {
  public async run() {
    await BodyType.createMany([
      {
        name: "slim"
      },
      {
        name: "muscular"
      },
      {
        name: "fat"
      },
      {
        name: "athletic"
      },
      {
        name: "chubby"
      },
      {
        name: "stocky"
      },
      {
        name: "lithe"
      },
      {
        name: "obese"
      },
      {
        name: "fit"
      },
      {
        name: "v-shaped"
      },
      {
        name: "slender"
      },
      {
        name: "toned"
      },
      {
        name: "statuesque"
      },
      {
        name: "plump"
      },
      {
        name: "curvy"
      }
    ])
  }
}
