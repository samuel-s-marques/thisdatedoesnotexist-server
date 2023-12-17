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

  public async getImages(history: {}, promptId: string, uid: string) {
    try {
      const defaultImage = history[promptId].outputs['35'].images[0]
      const upscaledImage = history[promptId].outputs['32'].images[0]

      for (const image of [defaultImage, upscaledImage]) {
        const { filename, subfolder, type } = image
        let resultFilename = uid

        if (filename.includes('x2')) {
          resultFilename += '_x2'
        }

        const response = await axios.get(
          `${ComfyUiService.API_URL}/view?filename=${filename}&subfolder=${subfolder}&type=${type}`,
          {
            responseType: 'stream',
          }
        )
        const writer = fs.createWriteStream(
          `${Application.publicPath('uploads/characters')}/${resultFilename}.png`
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
              ckpt_name: 'cyberrealistic_v41BackToBasics.safetensors',
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
              text: `embedding:CyberRealistic_Negative-neg, ${negativePrompt}`,
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
              vae: ['38', 0],
            },
            class_type: 'VAEDecode',
          },
          '26': {
            inputs: {
              model_name: 'BSRGANx2.pth',
            },
            class_type: 'UpscaleModelLoader',
          },
          '28': {
            inputs: {
              upscale_model: ['26', 0],
              image: ['7', 0],
            },
            class_type: 'ImageUpscaleWithModel',
          },
          '32': {
            inputs: {
              filename_prefix: `${uid}_x2`,
              images: ['28', 0],
            },
            class_type: 'SaveImage',
          },
          '35': {
            inputs: {
              filename_prefix: uid,
              images: ['7', 0],
            },
            class_type: 'SaveImage',
          },
          '38': {
            inputs: {
              vae_name: 'vae-ft-mse-840000-ema-pruned.safetensors',
            },
            class_type: 'VAELoader',
          },
        },
      }

      const response = await axios.post(`${ComfyUiService.API_URL}/prompt`, payload)
      Logger.info('Prompt sent.')
      if (response.status == 200) {
        const promptId = response.data.prompt_id

        let history = {}
        let attempts = 0
        const maxAttempts = 10

        while (Object.keys(history).length === 0 && attempts < maxAttempts) {
          attempts++
          history = await this.getHistory(promptId)

          if (Object.keys(history).length === 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }
        }

        if (Object.keys(history).length !== 0) {
          Logger.info('Got history.')
          await this.getImages(history, promptId, uid)
        } else {
          Logger.error('Max attempts reached. Unable to retrieve non-empty history.')
        }
      }
    } catch (error) {
      Logger.error('Error generating image: ', error)
    }
  }
}
