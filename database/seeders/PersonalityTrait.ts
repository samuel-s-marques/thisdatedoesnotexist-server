import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import PersonalityTraitModel from 'App/Models/PersonalityTraitModel'

export default class extends BaseSeeder {
  public async run() {
    await PersonalityTraitModel.createMany([
      {
        name: 'introvert',
        type: 'positive',
      },
      {
        name: 'extrovert',
        type: 'positive',
      },
      {
        name: 'optimistic',
        type: 'positive',
      },
      {
        name: 'pessimistic',
        type: 'negative',
      },
      {
        name: 'confident',
        type: 'positive',
      },
      {
        name: 'insecure',
        type: 'negative',
      },
      {
        name: 'patient',
        type: 'positive',
      },
      {
        name: 'impatient',
        type: 'negative',
      },
      {
        name: 'ambitious',
        type: 'positive',
      },
      {
        name: 'logical',
        type: 'positive',
      },
      {
        name: 'content',
        type: 'positive',
      },
      {
        name: 'emotional',
        type: 'positive',
      },
      {
        name: 'open-minded',
        type: 'positive',
      },
      {
        name: 'closed-minded',
        type: 'negative',
      },
      {
        name: 'organized',
        type: 'positive',
      },
      {
        name: 'disorganized',
        type: 'negative',
      },
      {
        name: 'spontaneous',
        type: 'negative',
      },
      {
        name: 'methodical',
        type: 'positive',
      },
      {
        name: 'assertive',
        type: 'positive',
      },
      {
        name: 'passive',
        type: 'negative',
      },
      {
        name: 'empathetic',
        type: 'positive',
      },
      {
        name: 'apathetic',
        type: 'negative',
      },
      {
        name: 'creative',
        type: 'positive',
      },
      {
        name: 'pratical',
        type: 'positive',
      },
      {
        name: 'humble',
        type: 'positive',
      },
      {
        name: 'arrogant',
        type: 'negative',
      },
      {
        name: 'curious',
        type: 'positive',
      },
      {
        name: 'indifferent',
        type: 'negative',
      },
      {
        name: 'sociable',
        type: 'positive',
      },
      {
        name: 'reclusive',
        type: 'negative',
      },
      {
        name: 'reliable',
        type: 'positive',
      },
      {
        name: 'unpredictable',
        type: 'negative',
      },
      {
        name: 'detail-oriented',
        type: 'positive',
      },
      {
        name: 'big-picture thinker',
        type: 'positive',
      },
      {
        name: 'flexible',
        type: 'positive',
      },
      {
        name: 'stubborn',
        type: 'negative',
      },
      {
        name: 'energetic',
        type: 'positive',
      },
      {
        name: 'lethargic',
        type: 'negative',
      },
      {
        name: 'independent',
        type: 'positive',
      },
      {
        name: 'dependent',
        type: 'negative',
      },
      {
        name: 'analytical',
        type: 'positive',
      },
      {
        name: 'intuitive',
        type: 'positive',
      },
      {
        name: 'self-disciplined',
        type: 'positive',
      },
      {
        name: 'procrastinating',
        type: 'negative',
      },
      {
        name: 'honest',
        type: 'positive',
      },
      {
        name: 'deceptive',
        type: 'negative',
      },
      {
        name: 'generous',
        type: 'positive',
      },
      {
        name: 'selfish',
        type: 'negative',
      },
      {
        name: 'adventurous',
        type: 'positive',
      },
      {
        name: 'cautious',
        type: 'positive',
      },
      {
        name: 'perfectionistic',
        type: 'negative',
      },
      {
        name: 'accepting',
        type: 'positive',
      },
      {
        name: 'cynical',
        type: 'negative',
      },
      {
        name: 'trusting',
        type: 'positive',
      },
      {
        name: 'manipulative',
        type: 'negative',
      },
      {
        name: 'overly competitive',
        type: 'negative',
      },
      {
        name: 'genuine',
        type: 'positive',
      },
      {
        name: 'cooperative',
        type: 'positive',
      },
      {
        name: 'lustful',
        type: 'negative',
      },
      {
        name: 'chaste',
        type: 'positive',
      },
    ])
  }
}
