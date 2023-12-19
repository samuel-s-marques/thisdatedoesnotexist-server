import Env from '@ioc:Adonis/Core/Env'
import User from 'App/Models/User'
import Logger from '@ioc:Adonis/Core/Logger'
import axios, { AxiosRequestConfig } from 'axios'

export default class KoboldService {
  private static instance: KoboldService
  private static readonly API_URL = Env.get('KOBOLD_API_URL')

  public static getInstance(): KoboldService {
    if (!KoboldService.instance) {
      KoboldService.instance = new KoboldService()
    }

    return KoboldService.instance
  }

  public async sendMessage(message: string, character: User, user: User) {
    try {
      Logger.info('Sending message to Kobold AI.')

      const requestOptions: AxiosRequestConfig = {
        method: 'POST',
        url: `${KoboldService.API_URL}/api/v1/generate`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          prompt: message,
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
          stop_sequence: [
            `\n${user.name}:`,
            `\n${user.name} ${user.surname}:`,
            '\nYou:',
            '\n\n',
            `\n${character.name}:`,
            `\n${character.name} ${character.surname}:`,
          ],
        },
      }

      const response = await axios(requestOptions)
      Logger.info('Got response from Kobold AI.')
      return response.data.results[0].text
    } catch (error) {
      Logger.error('Error sending message to Kobold AI: ', error)
    }
  }
}
