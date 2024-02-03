import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import axios, { AxiosRequestConfig } from 'axios'
import Config from '@ioc:Adonis/Core/Config'

export default class TextGenerationService {
  private static instance: TextGenerationService
  private static readonly API_URL = Env.get('TEXT_GENERATION_API_URL')

  public static getInstance(): TextGenerationService {
    if (!TextGenerationService.instance) {
      TextGenerationService.instance = new TextGenerationService()
    }

    return TextGenerationService.instance
  }

  public async sendPrompt(prompt: string) {
    try {
      Logger.info('Sending prompt to Text Generation AI.')
      const api = Config.get('app.llm.api')
      let data = {}
      let apiRoute = ''

      switch (api) {
        case 'kobold':
          apiRoute = 'api/v1/generate'
          data = {
            prompt: prompt,
            use_story: false,
            use_memory: false,
            use_authors_note: false,
            use_world_info: false,
            max_context_length: 2048,
            max_length: 300,
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
            sampler_full_determinism: false,
            frmttriminc: false,
            frmtrmblln: false,
          }
          break
        case 'oobabooga':
          apiRoute = 'v1/chat/completions'
          data = {
            prompt: prompt,
            max_context_length: 2048,
            max_tokens: 300,
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
          }
          break
      }

      const requestOptions: AxiosRequestConfig = {
        method: 'POST',
        url: `${TextGenerationService.API_URL}/${apiRoute}`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: data,
      }

      const response = await axios(requestOptions)
      Logger.info('Got response from Text Generation AI.')

      switch (api) {
        case 'kobold':
          return response.data.results[0].text
        case 'oobabooga':
          return response.data.choices[0].text
      }
    } catch (error) {
      Logger.error(error, 'Error sending prompt to Text Generation AI.')
    }
  }
}
