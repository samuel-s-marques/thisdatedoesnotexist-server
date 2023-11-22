import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import HobbyModel from 'App/Models/HobbyModel'

export default class extends BaseSeeder {
  public async run() {
    await HobbyModel.createMany([
      {
        name: 'reading',
        type: 'leisure',
      },
      {
        name: 'hiking',
        type: 'outdoor recreation',
      },
      {
        name: 'camping',
        type: 'outdoor recreation',
      },
      {
        name: 'backpacking',
        type: 'outdoor recreation',
      },
      {
        name: 'cycling',
        type: 'sports',
      },
      {
        name: 'mountain biking',
        type: 'sports',
      },
      {
        name: 'road biking',
        type: 'sports',
      },
      {
        name: 'running',
        type: 'sports',
      },
      {
        name: 'jogging',
        type: 'sports',
      },
      {
        name: 'trail running',
        type: 'sports',
      },
      {
        name: 'swimming',
        type: 'sports',
      },
      {
        name: 'snorkeling',
        type: 'sports',
      },
      {
        name: 'scuba diving',
        type: 'sports',
      },
      {
        name: 'rock climbing',
        type: 'sports',
      },
      {
        name: 'painting',
        type: 'creative',
      },
      {
        name: 'drawing',
        type: 'creative',
      },
      {
        name: 'sculpting',
        type: 'creative',
      },
      {
        name: 'pottery',
        type: 'creative',
      },
      {
        name: 'ceramics',
        type: 'creative',
      },
      {
        name: 'photography',
        type: 'creative',
      },
      {
        name: 'singing',
        type: 'creative',
      },
      {
        name: 'karaoke',
        type: 'creative',
      },
      {
        name: 'gaming',
        type: 'leisure',
      },
      {
        name: 'baking',
        type: 'culinary',
      },
      {
        name: 'yoga',
        type: 'fitness',
      },
      {
        name: 'pilates',
        type: 'fitness',
      },
      {
        name: 'watching movies',
        type: 'leisure',
      },
      {
        name: 'astronomy',
        type: 'science',
      },
      {
        name: 'stargazing',
        type: 'science',
      },
      {
        name: 'programming',
        type: 'technology',
      },
      {
        name: 'electronics',
        type: 'technology',
      },
      {
        name: 'robotics',
        type: 'technology',
      },
      {
        name: 'studying new languages',
        type: 'educational',
      },
      {
        name: 'fashion design',
        type: 'creative',
      },
      {
        name: 'chess',
        type: 'board games',
      },
      {
        name: 'poker',
        type: 'card games',
      },
      {
        name: 'Magic: The Gathering',
        type: 'card games',
      },
      {
        name: 'birdwatching',
        type: 'outdoor recreation',
      },
      {
        name: 'tarot and oracle card readings',
        type: 'spiritual',
      },
      {
        name: 'community service',
        type: 'volunteering',
      },
      {
        name: 'charity work',
        type: 'volunteering',
      },
      {
        name: 'gardening',
        type: 'outdoor recreation',
      },
      {
        name: 'meditation',
        type: 'spiritual',
      },
      {
        name: 'cooking',
        type: 'culinary',
      },
      {
        name: 'writing',
        type: 'creative',
      },
      {
        name: 'podcasting',
        type: 'creative',
      },
      {
        name: 'traveling',
        type: 'leisure',
      },
      {
        name: 'reading comics',
        type: 'leisure',
      },
      {
        name: 'clubbing',
        type: 'leisure',
      },
      {
        name: 'bowling',
        type: 'leisure',
      },
    ])
  }
}
