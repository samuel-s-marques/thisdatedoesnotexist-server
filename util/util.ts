import { Character } from 'character-forge'
import seedrandom from 'seedrandom'

/**
 * Extends the Array prototype with a new method called formattedJoin.
 * This method joins the elements of an array into a string, with a comma and space between each element.
 * The last element is preceded by "and" instead of a comma.
 * If the array is empty, an empty string is returned.
 * @returns {string} The formatted string.
 */
declare global {
  interface Array<T> {
    formattedJoin(): string
  }
}

Array.prototype.formattedJoin = function () {
  if (this.length > 1) {
    return this.join(', ').replace(/, ([^,]*)$/, ', and $1')
  } else if (this.length === 1) {
    return this[0]
  }

  return ''
}

/**
 * Builds an image prompt string based on the given character object.
 * @param character - The character object to build the prompt from.
 * @returns The generated image prompt string.
 */
export function imagePromptBuilder(character: Character) {
  const expressions = [
    'seductive smirk',
    'smiling',
    'focused',
    'distracted',
    'serious',
    'neutral',
    '(troubled facial expression)',
    'happy',
  ]
  const expression = expressions[Math.floor(Math.random() * expressions.length)]

  const photoTypes = [
    'selfie',
    'portrait',
    'instagram selfie',
    'looking at viewer',
    'candid shot',
    'full body shot',
    'nighttime',
    '(from behind)',
  ]
  const photoType = photoTypes[Math.floor(Math.random() * photoTypes.length)]

  const places = [
    'indoors',
    'outdoors',
    'at home',
    'in a park',
    'riding the subway',
    'in an indoor gym',
    'in a party',
    'in a farm',
    'in a shopping mall',
    'in a store',
    'in a restaurant',
    'in a nightclub',
    'in a beach',
    'in a bar',
    'in a cafe',
    'in a club',
    'in a library',
    'in a classroom',
    'in a hospital',
    'in a hotel',
    'in a motel',
    'in a bedroom',
    'in a bathroom',
    'in a kitchen',
    'in a living room',
    'in a dining room',
  ]
  const place = places[Math.floor(Math.random() * places.length)]

  let age = ''

  if (character.age >= 18 && character.age <= 25) {
    age = 'a young adult'
  } else if (character.age >= 26 && character.age <= 35) {
    age = 'an adult'
  } else if (character.age >= 36 && character.age <= 55) {
    age = 'a middle aged'
  } else if (character.age >= 56) {
    age = 'a senior'
  }

  let sex = character.sex === 'male' ? 'man' : 'woman'

  let prompt = ''

  prompt += `${character.bodyType.type} `
  prompt += `${character.skinTone} skin ${character.ethnicity}, `
  prompt += `(${character.hairColor}) (${character.hairStyle} hairstyle), `
  prompt += `${character.eyeColor} eyes, `
  prompt += `wearing ${character.clothings.upperbody}, `
  prompt += `wearing ${character.clothings.lowerbody}`

  if (character.clothings.accessories.length !== 0) {
    prompt += `, wearing ${character.clothings.accessories.formattedJoin()}`
  }

  prompt += `, (${photoType}), ${expression}, (${place}), (${age} ${sex}: 1.5)`

  return prompt
}

export function negativeImagePromptBuilder(sex: string): string {
  let negativePrompts = [
    '(deformed iris, deformed hands, worst quality, low quality, normal quality:2)',
    'illustration',
    'painting',
    'cartoon',
    'young',
    'new',
    'anime',
    'doll',
    '3d',
    'cloned face',
    'disfigured',
    'gross proportions',
    'malformed limbs',
    'missing arms',
    'missing legs',
    'extra arms',
    'extra legs',
    'fused fingers',
    'too many fingers',
    'long neck',
    'username',
    'watermark',
    'signature',
    'mutation',
    'mutated',
    'teen',
    'child',
    'kid',
    'children',
  ]

  if (sex === 'male') {
    negativePrompts.push('woman')
    negativePrompts.push('female')
  } else {
    negativePrompts.push('man')
    negativePrompts.push('male')
  }

  return negativePrompts.join(', ')
}

export function promptBuilder(session: any): string {
  let prompt: string = pListBuilder(session.character)
  let lastMessages = session.messages.slice(-5)
  let lastSender = 'character'

  for (let message of lastMessages) {
    if (message.from === 'user') {
      // Check if the last sender was the character and append accordingly
      if (lastSender === 'character') {
        prompt += `\nUser:${message.message}`
      } else {
        prompt += `${message.message}`
      }
      // Update the last sender to "user"
      lastSender = 'user'
    } else {
      // Check if the last sender was the user and append accordingly
      if (lastSender === 'user') {
        prompt += `\n${session.character.name}:${message.message}`
      } else {
        prompt += `${message.message}`
      }
      // Update the last sender to "character"
      lastSender = 'character'
    }
  }

  // Ensure the last line ends with \ncharacter.name:
  if (!prompt.endsWith(`\n${session.character.name}:`)) {
    prompt += `\n${session.character.name}:`
  }

  return prompt
}

export function pListBuilder(character: Character): string {
  let appearance = `${character.name}'s appearance: hair(${character.hairStyle}, ${character.hairColor}), eyes(${character.eyeColor}), body(${character.bodyType.type}), clothings(${character.clothings.upperbody}, ${character.clothings.lowerbody}), ethnicity(${character.ethnicity})`

  const tags = ['slice of life', 'real life']
  const scenario = `Conversation between User and ${character.name}`

  const attributes = character.personalityTraits.map((trait) => trait.name).join(', ')
  const hobbies = character.hobbies.join(', ')

  let persona = `${character.name}'s persona: ${attributes}, hobbies(${hobbies}), ${character.occupation}, ${character.pronouns.subjectPronoun}/${character.pronouns.objectPronoun}, sexuality(${character.sexuality.sexuality})`

  if (character.phobia !== undefined) {
    persona += `, fears(${character.phobia})`
  }

  return `[${appearance};\nTags: ${tags.join(', ')};\n${scenario};\n${persona}]`
}

export function generateRandomSeed(seed: string): number {
  const rng = seedrandom(seed)
  const randomValue = rng.int32()

  const randomInteger = Math.floor(randomValue * 10000) + 1
  return Math.abs(randomInteger)
}
