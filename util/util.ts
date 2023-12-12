import sharp from 'sharp'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { Character } from 'character-forge'

declare global {
  interface String {
    isUUID(): boolean
  }
}

String.prototype.isUUID = function (): boolean {
  const uuidRegex: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(this)
}

/**
 * Processes an array of base64-encoded images, saves them to disk, and returns an array of their file paths.
 * @param images An array of base64-encoded images.
 * @returns An array of file paths where the processed images were saved.
 */
export async function processImage(imageData: Uint8Array): Promise<string> {
  let imageResult: string = ''

  try {
    const image = sharp(imageData)
    const outputImageBuffer = await image.toBuffer()
    const uuid = uuidv4()

    if (!fs.existsSync('output')) {
      fs.mkdirSync('output')
    }

    fs.writeFileSync(`output/images/${uuid}.png`, outputImageBuffer)
    imageResult = uuid

    console.log(`🤖 [server]: Images processed and saved.`)
  } catch (error) {
    console.error('Error processing images: ', error)
  }

  return imageResult
}

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
  let prompt = 'RAW Photo, DSLR BREAK '

  prompt += `${character.bodyType.type} `
  prompt += `${character.skinTone} skin ${character.ethnicity} ${character.occupation}, `
  prompt += `${character.age} years old ${character.sex}, `
  prompt += `${character.hairColor} color ${character.hairStyle} hairstyle, `
  prompt += `${character.eyeColor} eyes, `
  prompt += `wearing ${character.clothings.upperbody}`

  if (character.clothings.accessories.length !== 0) {
    prompt += `, wearing ${character.clothings.accessories.formattedJoin()}`
  }

  prompt += ', (looking at viewer), focused, detailed, natural light'

  return prompt
}

export function negativeImagePromptBuilder(sex: string): string {
  let negativePrompts = [
    'paintings',
    'sketches',
    'lowres',
    'bad anatomy',
    'DeepNegative',
    'facing away',
    'looking away',
    'tilted head',
    'bad hands',
    'text',
    'error',
    'missing fingers',
    'cropped',
    'low quality',
    'normal quality',
    'jpeg artifacts',
    'watermark',
    'blurry',
    'long neck',
    'deformed',
  ]

  if (sex === 'male') {
    negativePrompts.push('female')
  } else {
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
