import Message from 'App/Models/Message'
import User from 'App/Models/User'
import { Character } from 'character-forge'
import seedrandom from 'seedrandom'
import instructionsJson from '../assets/json/instructions.json'
import generalInstructionsJson from '../assets/json/general_instructions.json'
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
  prompt += '{{separator_sequence}}'

  for (let message of messages) {
    if (message.user_id === user.id) {
      // Check if the last sender was the character and append accordingly
      if (lastSender === 'character') {
        prompt += `{{input_sequence}}${user.name} ${user.surname}:\n${message.content}{{output_sequence}}`
      } else {
        prompt += `${message.content}{{output_sequence}}`
      }
      // Update the last sender to "user"
      lastSender = 'user'
    } else {
      // Check if the last sender was the user and append accordingly
      if (lastSender === 'user') {
        prompt += `{{output_sequence}}{{separator_sequence}}${character.name} ${character.surname}:\n${message.content}{{separator_sequence}}`
      } else {
        prompt += `${message.content}{{separator_sequence}}`
      }
      // Update the last sender to "character"
      lastSender = 'character'
    }
  }

  // Ensure the last line ends with \ncharacter.name:
  if (!prompt.endsWith(`${character.name}:`)) {
    prompt += `${character.name} ${character.surname}:\n`
  }

  return prompt
}

export function pListBuilder(character: User, user: User): string {
  let userData = ''

  // Character data
  let characterAppearance = `${character.name} ${character.surname}'s appearance: {{appearance}}`
  let characterPersona = `${character.name} ${character.surname}'s profile: {{details}}`

  if (character.phobia !== null) {
    characterPersona += `, fears(${character.phobia})`
  }
  const characterData = `${characterAppearance};\n${characterPersona}`

  // User data
  let userAppearance = `${user.name} ${user.surname}'s appearance: body(${user.height.toFixed(
    2
  )}m, ${user.weight.toFixed(2)}kg), country(${user.country}), age(${user.age})`
  const userHobbies = user.hobbies.map((hobby) => hobby.name).join(', ')
  const userGoal = user.relationshipGoal.name
  const userPersona = `${user.name} ${user.surname}'s profile: bio(${user.bio}), hobbies(${userHobbies}), occupation(${user.occupation}), ${user.pronoun.subjectPronoun}/${user.pronoun.objectPronoun}, relationship goal(${userGoal}), religion(${user.religion}), political view(${user.politicalView}), bio(${user.bio})`
  userData = `${userAppearance};\n${userPersona}`

  return `Tags: {{tags}}\n${userData}\n${characterData}\nContext: {{context}}\nScenario: {{scenario}}\n`
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

function replaceFunction(content: string, replacements: object) {
  Object.keys(replacements).forEach((key) => {
    const regex = new RegExp(key, 'g')
    content = content.replace(regex, replacements[key] || '')
  })

  return content
}

export function clearSymbols(content: string, symbols: string[]): string {
  symbols.forEach((symbol) => {
    content = content.replace(new RegExp(symbol, 'g'), '')
  })

  return content
}

export function replaceMacros(content: string, character: object, user?: User): string {
  const instructions = instructionsJson[Config.get('app.llm.promptFormat')]

  const generalReplacements = {
    '{{user}}': user != null ? `${user.name} ${user.surname}` : '',
    '{{char}}': `${character['name']} ${character['surname']}`,
    '{{hairstyle}}': character['hairStyle'],
    '{{hair_color}}': character['hairColor'],
    '{{eyecolor}}': character['eyeColor'],
    '{{body_type}}': character['bodyType'],
    '{{height}}': character['height'].toFixed(2),
    '{{weight}}': character['weight'].toFixed(2),
    '{{ethnicity}}': character['ethnicity'],
    '{{country}}': character['country'],
    '{{skin}}': character['skinTone'],
    '{{age}}': character['age'].toString(),
    '{{pronouns}}': `${character['pronoun']['subjectPronoun']}/${character['pronoun']['objectPronoun']}`,
    '{{hobbies}}': character['hobbies'].map((hobby) => hobby.name).join(', '),
    '{{occupation}}': character['occupation'],
    '{{sexuality}}': character['sexuality'],
    '{{relationship_goal}}': character['relationshipGoal']['name'],
    '{{religion}}': character['religion'],
    '{{political_view}}': character['politicalView'],
    '{{social_class}}': character['socialClass'],
    '{{traits}}': character['personalityTraits'].map((trait) => trait.name).join(', '),
  }

  const replacements = {
    '{{system_prompt}}': replaceFunction(instructions.system_prompt, generalReplacements),
    '{{input_sequence}}': instructions.input_sequence,
    '{{output_sequence}}': instructions.output_sequence,
    '{{separator_sequence}}': instructions.separator_sequence,
    '{{first_output_sequence}}': instructions.first_output_sequence,
    '{{system_sequence_prefix}}': instructions.system_sequence_prefix,
    '{{system_sequence_suffix}}': instructions.system_sequence_suffix,
    '{{stop_sequence}}': instructions.stop_sequence,
    '{{scenario}}': replaceFunction(generalInstructionsJson.scenario, generalReplacements),
    '{{context}}': replaceFunction(generalInstructionsJson.context, generalReplacements),
    '{{details}}': replaceFunction(generalInstructionsJson.details, generalReplacements),
    '{{appearance}}': replaceFunction(generalInstructionsJson.appearance, generalReplacements),
    '{{tags}}': generalInstructionsJson.tags,
  }

  content = replaceFunction(content, generalReplacements)
  content = replaceFunction(content, replacements)

  return content
}

export function characterAgeMapping(age: number) {
  if (age >= 18 && age <= 25) {
    return -(Math.floor(getRandomInt(10, 100) + 10) / 100)
  } else if (age >= 26 && age <= 35) {
    return Math.floor(getRandomInt(0, 100) + 0) / 100
  } else if (age >= 36 && age <= 55) {
    return Math.floor(getRandomInt(100, 150) + 100) / 100
  } else if (age >= 56) {
    return Math.floor(getRandomInt(150, 200) + 150) / 100
  }
}

export function characterSexMapping(sex: string) {
  if (sex === 'male') {
    return -(Math.floor(getRandomInt(100, 500)) / 100)
  } else {
    return Math.floor(getRandomInt(100, 500)) / 100
  }
}

export function breastSizeMapping(sex: string, bodyType: string) {
  if (sex === 'male') {
    return 0
  } else {
    switch (bodyType) {
      case 'obese':
        return 1
      case 'plump':
      case 'chubby':
        return getRandomInt(0.8, 1)
      case 'fat':
        return 1
      case 'curvy':
        return getRandomInt(0.5, 1)
      default:
        return Math.random() * 2 - 1
    }
  }
}

export function muscleMapping(bodyType: string) {
  switch (bodyType) {
    case 'muscular':
      return getRandomInt(4, 5)
    case 'athletic':
    case 'stocky':
      return getRandomInt(2, 3)
    case 'slim':
    case 'fit':
    case 'v-shaped':
      return getRandomInt(1, 2)
    case 'slender':
      return getRandomInt(-1.5, -2.5)
    case 'lithe':
      return getRandomInt(-1, -2)
    case 'statuesque':
      return getRandomInt(-1, 1)
    default:
      return 0
  }
}

export function weightMapping(bodyType: string) {
  switch (bodyType) {
    case 'obese':
      return getRandomInt(2.5, 3)
    case 'chubby':
      return getRandomInt(1.5, 2.5)
    case 'plump':
      return getRandomInt(1, 2)
    case 'fat':
      return getRandomInt(2, 3)
    case 'curvy':
      return getRandomInt(1, 2)
    default:
      return 0
  }
}

export function getRandomInt(min: number, max: number) {
  if (min > max) {
    throw new Error('Min cannot be greater than max')
  } else {
    return Math.random() * (max - min + 1) + min
  }
}
