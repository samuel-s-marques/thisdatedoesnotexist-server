import axios from 'axios'
import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import { generateRandomSeed, imagePromptBuilder, negativeImagePromptBuilder } from 'Util/util'
import { Character } from 'character-forge'
import fs from 'fs'
import Application from '@ioc:Adonis/Core/Application'

export default class ComfyUiService {
  private static instance: ComfyUiService
  private static readonly API_URL = Env.get('COMFY_UI_API_URL')

  public static getInstance(): ComfyUiService {
    if (!ComfyUiService.instance) {
      ComfyUiService.instance = new ComfyUiService()
    }

    return ComfyUiService.instance
  }

  public async getHistory(promptId: string) {
    try {
      const response = await axios.get(`${ComfyUiService.API_URL}/history/${promptId}`)

      if (response.status == 200) {
        Logger.info('Got history.')
        return response.data
      }
    } catch (error) {
      Logger.error("Error retrieving the image's history: ", error)
    }
  }

  public async getImage(history: {}, promptId: string, uid: string) {
    try {
      const firstImage = history[promptId].outputs['9'].images[0]

      if (firstImage) {
        const { filename, subfolder, type } = firstImage

        const response = await axios.get(
          `${ComfyUiService.API_URL}/view?filename=${filename}&subfolder=${subfolder}&type=${type}`,
          {
            responseType: 'stream',
          }
        )
        const writer = fs.createWriteStream(
          `${Application.publicPath('uploads/characters')}/${uid}.png`
        )

        response.data.pipe(writer)
        await new Promise<void>((resolve, reject) => {
          writer.on('finish', resolve)
          writer.on('error', reject)
        })

        Logger.info('Image processed and saved.')
      }
    } catch (error) {
      console.log(error)
      Logger.error('Error retrieving the image: ', error)
    }
  }

  public async sendPrompt(character: Character, uid: string) {
    try {
      const randomSeed = generateRandomSeed(
        `${character.name}+${character.surname}+${character.age}`
      )
      const prompt = imagePromptBuilder(character)
      const negativePrompt = negativeImagePromptBuilder(character.sex)

      const payload = {
        prompt: {
          '1': {
            inputs: {
              ckpt_name: 'analogMadness_v70.safetensors',
            },
            class_type: 'CheckpointLoaderSimple',
          },
          '2': {
            inputs: {
              lora_name: 'LCM_LoRA_Weights_SD15.safetensors',
              strength_model: 1,
              strength_clip: 1,
              model: ['1', 0],
              clip: ['1', 1],
            },
            class_type: 'LoraLoader',
          },
          '3': {
            inputs: {
              text: prompt,
              clip: ['2', 1],
            },
            class_type: 'CLIPTextEncode',
          },
          '4': {
            inputs: {
              text: negativePrompt,
              clip: ['1', 1],
            },
            class_type: 'CLIPTextEncode',
          },
          '5': {
            inputs: {
              seed: randomSeed,
              steps: 8,
              cfg: 1.3,
              sampler_name: 'lcm',
              scheduler: 'normal',
              denoise: 1,
              model: ['2', 0],
              positive: ['3', 0],
              negative: ['4', 0],
              latent_image: ['6', 0],
            },
            class_type: 'KSampler',
          },
          '6': {
            inputs: {
              width: 512,
              height: 768,
              batch_size: 1,
            },
            class_type: 'EmptyLatentImage',
          },
          '7': {
            inputs: {
              samples: ['5', 0],
              vae: ['1', 2],
            },
            class_type: 'VAEDecode',
          },
          '9': {
            inputs: {
              filename_prefix: uid,
              images: ['7', 0],
            },
            class_type: 'SaveImage',
          },
        },
      }

      const response = await axios.post(`${ComfyUiService.API_URL}/prompt`, payload)
      Logger.info('Prompt sent.')
      if (response.status == 200) {
        const promptId = response.data.prompt_id

        let history = {}
        let attempts = 0
        const maxAttempts = 5

        while (Object.keys(history).length === 0 && attempts < maxAttempts) {
          attempts++
          history = await this.getHistory(promptId)

          if (Object.keys(history).length === 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }
        }

        if (Object.keys(history).length !== 0) {
          Logger.info('Got history.')
          await this.getImage(history, promptId, uid)
        } else {
          Logger.error('Max attempts reached. Unable to retrieve non-empty history.')
        }
      }
    } catch (error) {
      Logger.error('Error generating image: ', error)
    }
  }
}
