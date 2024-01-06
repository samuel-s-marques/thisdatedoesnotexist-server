import Message from 'App/Models/Message'
import User from 'App/Models/User'
import { Character } from 'character-forge'
import seedrandom from 'seedrandom'
import instructionsJson from '../assets/json/instructions.json'
import Config from '@ioc:Adonis/Core/Config'

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
    '(from behind looking at viewer)',
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

export function promptBuilder(messages: Message[], character: User, user: User): string {
  let prompt: string = pListBuilder(character, user)
  let lastSender = 'character'
  prompt += '\n'

  for (let message of messages) {
    if (message.user_id === user.id) {
      // Check if the last sender was the character and append accordingly
      if (lastSender === 'character') {
        prompt += `[input_sequence]${user.name} ${user.surname}: ${message.content}[separator_sequence]`
      } else {
        prompt += `${message.content}[separator_sequence]`
      }
      // Update the last sender to "user"
      lastSender = 'user'
    } else {
      // Check if the last sender was the user and append accordingly
      if (lastSender === 'user') {
        prompt += `[output_sequence][separator_sequence]${character.name} ${character.surname}: ${message.content}[separator_sequence]`
      } else {
        prompt += `${message.content}[separator_sequence]`
      }
      // Update the last sender to "character"
      lastSender = 'character'
    }
  }

  // Ensure the last line ends with \ncharacter.name:
  if (!prompt.endsWith(`${character.name}: `)) {
    prompt += `${character.name} ${character.surname}: `
  }

  return prompt
}

export function pListBuilder(character: User, user: User): string {
  let userData = ''
  let characterData = ''

  // Character data
  let characterAppearance = `${character.name} ${character.surname}'s appearance: hair(${
    character.hairStyle
  }, ${character.hairColor}), eyes(${character.eyeColor}), body(${
    character.bodyType
  }, ${character.height.toFixed(2)}m, ${character.weight.toFixed(2)}kg), ethnicity(${
    character.ethnicity
  }), country(${character.country}), skin(${character.skinTone}), age(${character.age})`

  const characterAttributes = character.personalityTraits.map((trait) => trait.name).join(', ')
  const characterHobbies = character.hobbies.map((hobby) => hobby.name).join(', ')
  const characterGoal = character.relationshipGoal.name

  let characterPersona = `${character.name} ${character.surname}'s profile: ${characterAttributes}, hobbies(${characterHobbies}), occupation(${character.occupation}), ${character.pronoun.subjectPronoun}/${character.pronoun.objectPronoun}, sexuality(${character.sexuality}), relationship goal(${characterGoal}), religion(${character.religion}), political view(${character.politicalView}), social class(${character.socialClass})`

  if (character.phobia !== null) {
    characterPersona += `, fears(${character.phobia})`
  }
  characterData = `${characterAppearance};\n${characterPersona}`

  // User data
  let userAppearance = `${user.name} ${user.surname}'s appearance: body(${user.height.toFixed(
    2
  )}m, ${user.weight.toFixed(2)}kg), country(${user.country}), age(${user.age})`
  const userHobbies = user.hobbies.map((hobby) => hobby.name).join(', ')
  const userGoal = user.relationshipGoal.name
  const userPersona = `${user.name} ${user.surname}'s profile: bio(${user.bio}), hobbies(${userHobbies}), occupation(${user.occupation}), ${user.pronoun.subjectPronoun}/${user.pronoun.objectPronoun}, relationship goal(${userGoal}), religion(${user.religion}), political view(${user.politicalView}), bio(${user.bio})`
  userData = `${userAppearance};\n${userPersona}`

  const tags = ['slice of life', 'dating app'].join(', ')
  const context = `If ${user.name} ${user.surname} offends ${character.name} ${character.surname}, ${character.name} ${character.surname} can block by typing "/block".`

  return `[Tags: ${tags};\n${userData}\n${characterData}\nContext: ${context}]`
}

export function generateRandomSeed(seed: string): number {
  const rng = seedrandom(seed)
  const randomValue = rng.int32()

  const randomInteger = Math.floor(randomValue * 10000) + 1
  return Math.abs(randomInteger)
}

export function findMostCommonString(strings: string[]): string | undefined {
  const frequencyMap: { [key: string]: number } = {}

  for (const str of strings) {
    frequencyMap[str] = (frequencyMap[str] || 0) + 1
  }

  let mostCommonString: string | undefined
  let highestFrequency = 0

  for (const str in frequencyMap) {
    if (frequencyMap[str] > highestFrequency) {
      highestFrequency = frequencyMap[str]
      mostCommonString = str
    }
  }

  return mostCommonString
}

export function replaceMacros(content: string, user: string, character: string): string {
  const instructions = instructionsJson[Config.get('app.llm.modelInstructions')]

  const replacements = {
    '[user]': user,
    '[character]': character,
    '[system_prompt]': instructions.system_prompt,
    '[input_sequence]': instructions.input_sequence,
    '[output_sequence]': instructions.output_sequence,
    '[separator_sequence]': instructions.separator_sequence,
    '[first_output_sequence]': instructions.first_output_sequence,
    '[system_sequence_prefix]': instructions.system_sequence_prefix,
    '[system_sequence_suffix]': instructions.system_sequence_suffix,
    '[stop_sequence]': instructions.stop_sequence,
  }

  Object.keys(replacements).forEach((key) => {
    const regex = new RegExp(key, 'g')
    content = content.replace(regex, replacements[key])
  })

  return content
}
