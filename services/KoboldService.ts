import Env from '@ioc:Adonis/Core/Env'
import User from 'App/Models/User'
import Logger from '@ioc:Adonis/Core/Logger'
import axios, { AxiosRequestConfig } from 'axios'
import instructionsJson from '../assets/json/instructions.json'

export default class KoboldService {
  private static instance: KoboldService
  private static readonly API_URL = Env.get('KOBOLD_API_URL')

  public static getInstance(): KoboldService {
    if (!KoboldService.instance) {
      KoboldService.instance = new KoboldService()
    }

    return KoboldService.instance
  }

  public async sendPrompt(prompt: string, stop_sequence: string[]) {
    try {
      Logger.info('Sending prompt to Kobold AI.')

      const requestOptions: AxiosRequestConfig = {
        method: 'POST',
        url: `${KoboldService.API_URL}/api/v1/generate`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          prompt: prompt,
          use_story: false,
          use_memory: false,
          use_authors_note: false,
          use_world_info: false,
          max_context_length: 2048,
          max_length: 200,
          rep_pen: 1.2,
          rep_pen_range: 1024,
          rep_pen_slope: 0.7,
          temperature: 0.8,
          tfs: 0.9,
          top_a: 0,
          top_k: 0,
          top_p: 0.9,
          typical: 0.1,
          sampler_order: [6, 0, 1, 3, 4, 2, 5],
          singleline: false,
          sampler_seed: 69420,
          sampler_full_determinism: false,
          frmttriminc: false,
          frmtrmblln: false,
          stop_sequence: stop_sequence,
        },
      }

      const response = await axios(requestOptions)
      Logger.info('Got response from Kobold AI.')
      return response.data.results[0].text
    } catch (error) {
      Logger.error('Error sending prompt to Kobold AI: ', error)
    }
  }

  public async sendMessage(message: string, character: User, user: User, instruction: string) {
    const instructions = instructionsJson[instruction]

    const adaptedMessage = message
      .replace(/\[input_sequence\]/g, instructions.input_sequence)
      .replace(/\[output_sequence\]/g, instructions.output_sequence)
      .replace(/\[separator_sequence\]/g, instructions.separator_sequence)
    const prompt = `${instructions.input_sequence}Write ${character.name} ${character.surname}'s next reply in this fictional roleplay with ${user.name} ${user.surname}.\n${adaptedMessage}`

    return this.sendPrompt(prompt, [
      `\n${user.name}:`,
      `\n${user.name} ${user.surname}:`,
      `\n${character.name}:`,
      `\n${character.name} ${character.surname}:`,
      instructions.input_sequence,
      instructions.output_sequence,
      instructions.separator_sequence,
    ])
  }

  public async generateBio(
    character: User,
    instruction: string,
    hobbies: string[],
    personality_traits: string[]
  ) {
    const instructions = instructionsJson[instruction]
    const prompt = `${
      instructions.input_sequence
    }Write Assistant's next reply in this fictional roleplay with User.\nYou're a helpful assistant and straight to the point. Don't be afraid to offend or use NSFW. You can optionally use names.\n${
      instructions.output_sequence
    }${instructions.separator_sequence}${
      instructions.input_sequence
    } User: Generate a first-person short Tinder bio for a ${character.sex} ${
      character.occupation
    } who is ${personality_traits.formattedJoin()} and loves ${hobbies.formattedJoin()}. Name is ${
      character.name
    } ${character.surname}. ${instructions.output_sequence}${
      instructions.separator_sequence
    }Assistant:`

    return this.sendPrompt(prompt, [
      `\nUser:`,
      `\nAssistant:`,
      instructions.input_sequence,
      instructions.output_sequence,
      instructions.separator_sequence,
    ])
  }
}
