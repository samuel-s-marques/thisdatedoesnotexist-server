import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import BodyType from 'App/Models/BodyType'

export default class extends BaseSeeder {
  public async run() {
    await BodyType.createMany([
      {
        name: 'slim',
        sex: 'female',
      },
      {
        name: 'muscular',
        sex: 'female',
      },
      {
        name: 'fat',
        sex: 'female',
      },
      {
        name: 'athletic',
        sex: 'female',
      },
      {
        name: 'curvy',
        sex: 'female',
      },
      {
        name: 'petite',
        sex: 'female',
      },
      {
        name: 'chubby',
        sex: 'female',
      },
      {
        name: 'stocky',
        sex: 'female',
      },
      {
        name: 'lithe',
        sex: 'female',
      },
      {
        name: 'voluptuous',
        sex: 'female',
      },
      {
        name: 'obese',
        sex: 'female',
      },
      {
        name: 'statuesque',
        sex: 'female',
      },
      {
        name: 'boyish',
        sex: 'female',
      },
      {
        name: 'plump',
        sex: 'female',
      },
      {
        name: 'slim',
        sex: 'male',
      },
      {
        name: 'muscular',
        sex: 'male',
      },
      {
        name: 'fat',
        sex: 'male',
      },
      {
        name: 'athletic',
        sex: 'male',
      },
      {
        name: 'chubby',
        sex: 'male',
      },
      {
        name: 'stocky',
        sex: 'male',
      },
      {
        name: 'lithe',
        sex: 'male',
      },
      {
        name: 'obese',
        sex: 'male',
      },
      {
        name: 'fit',
        sex: 'male',
      },
      {
        name: 'v-shaped',
        sex: 'male',
      },
      {
        name: 'slender',
        sex: 'male',
      },
      {
        name: 'toned',
        sex: 'male',
      },
    ])
  }
}
