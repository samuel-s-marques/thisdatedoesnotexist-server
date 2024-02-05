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
        name: 'microscopy',
        type: 'science',
      },
      {
        name: 'model rocketry',
        type: 'science',
      },
      {
        name: 'model airplanes',
        type: 'science',
      },
      {
        name: 'spelunking',
        type: 'outdoor recreation',
      },
      {
        name: 'coins',
        type: 'collecting',
      },
      {
        name: 'stamps',
        type: 'collecting',
      },
      {
        name: 'antiques',
        type: 'collecting',
      },
      {
        name: 'wine',
        type: 'collecting',
      },
      {
        name: 'swords',
        type: 'collecting',
      },
      {
        name: 'artwork',
        type: 'collecting',
      },
      {
        name: 'fossils',
        type: 'collecting',
      },
      {
        name: 'miniature figures',
        type: 'collecting',
      },
      {
        name: 'action figures',
        type: 'collecting',
      },
      {
        name: 'classic video game',
        type: 'collecting',
      },
      {
        name: 'fishing',
        type: 'outdoor recreation',
      },
      {
        name: 'surfing',
        type: 'sports',
      },
      {
        name: 'skateboarding',
        type: 'sports',
      },
      {
        name: 'snowboarding',
        type: 'sports',
      },
      {
        name: 'skiing',
        type: 'sports',
      },
      {
        name: 'snowshoeing',
        type: 'sports',
      },
      {
        name: 'ice skating',
        type: 'sports',
      },
      {
        name: 'roller skating',
        type: 'sports',
      },
      {
        name: 'rollerblading',
        type: 'sports',
      },
      {
        name: 'skateboarding',
        type: 'sports',
      },
      {
        name: 'kayaking',
        type: 'sports',
      },
      {
        name: 'canoeing',
        type: 'sports',
      },
      {
        name: 'rafting',
        type: 'sports',
      },
      {
        name: 'sailing',
        type: 'sports',
      },
      {
        name: 'boating',
        type: 'sports',
      },
      {
        name: 'paddleboarding',
        type: 'sports',
      },
      {
        name: 'wakeboarding',
        type: 'sports',
      },
      {
        name: 'waterskiing',
        type: 'sports',
      },
      {
        name: 'parasailing',
        type: 'sports',
      },
      {
        name: 'kiteboarding',
        type: 'sports',
      },
      {
        name: 'skydiving',
        type: 'sports',
      },
      {
        name: 'bungee jumping',
        type: 'sports',
      },
      {
        name: 'base jumping',
        type: 'sports',
      },
      {
        name: 'paragliding',
        type: 'sports',
      },
      {
        name: 'hang gliding',
        type: 'sports',
      },
      {
        name: 'kite flying',
        type: 'sports',
      },
      {
        name: 'horseback riding',
        type: 'sports',
      },
      {
        name: 'hearts',
        type: 'card games',
      },
      {
        name: 'cribbage',
        type: 'card games',
      },
      {
        name: 'whist',
        type: 'card games',
      },
      {
        name: 'backgammon',
        type: 'board games',
      },
      {
        name: 'checkers',
        type: 'board games',
      },
      {
        name: 'Risk',
        type: 'board games',
      },
      {
        name: 'Monopoly',
        type: 'board games',
      },
      {
        name: 'Uno',
        type: 'card games',
      },
      {
        name: 'go',
        type: 'board games',
      },
      {
        name: 'Mahjong',
        type: 'board games',
      },
      {
        name: 'Clue',
        type: 'board games',
      },
      {
        name: 'Battleship',
        type: 'board games',
      },
      {
        name: 'The Game of Life',
        type: 'board games',
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
        name: 'astrology',
        type: 'spiritual',
      },
      {
        name: 'crystal healing',
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
