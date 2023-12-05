import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import PronounsModel from 'App/Models/PronounsModel'

export default class extends BaseSeeder {
  public async run() {
    await PronounsModel.createMany([
      {
        type: 'male',
        subjectPronoun: 'he',
        objectPronoun: 'him',
        possessiveAdjective: 'his',
        possessivePronoun: 'his',
      },
      {
        type: 'female',
        subjectPronoun: 'she',
        objectPronoun: 'her',
        possessiveAdjective: 'her',
        possessivePronoun: 'hers',
      },
    ])
  }
}
