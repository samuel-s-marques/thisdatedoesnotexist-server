import Env from '@ioc:Adonis/Core/Env'
import User from 'App/Models/User'
import Logger from '@ioc:Adonis/Core/Logger'
import axios, { AxiosRequestConfig } from 'axios'

export default class OobaboogaService {
  private static instance: OobaboogaService
  private static readonly API_URL = Env.get('OOBABOOGA_API_URL')

  public static getInstance(): OobaboogaService {
    if (!OobaboogaService.instance) {
      OobaboogaService.instance = new OobaboogaService()
    }

    return OobaboogaService.instance
  }

  public async sendMessage(message: string, character: User, user: User) {
    try {
      Logger.info('Sending message to Oobabooga.')

      const requestOptions: AxiosRequestConfig = {
        method: 'POST',
        url: `${OobaboogaService.API_URL}/api/v1/generate`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          prompt: message,
          max_context_length: 2048,
          max_length: 300,
          repetition_penalty: 1.2,
          repetition_penalty_range: 1024,
          repetition_penalty_slope: 0.7,
          temperature: 0.2,
          tfs: 0.9,
          top_a: 0,
          top_k: 0,
          top_p: 0.9,
          typical: 0.1,
          sampler_order: [6, 0, 1, 3, 4, 2, 5],
          singleline: false,
          ban_eos_token: false,
          stopping_strings: [
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
      Logger.info('Got response from Oobabooga.')
      return response.data.results[0].text
    } catch (error) {
      Logger.error('Error sending message to Oobabooga: ', error)
    }
  }
}
