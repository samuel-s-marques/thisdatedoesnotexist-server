import axios from 'axios'
import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import {
  breastSizeMapping,
  characterAgeMapping,
  characterSexMapping,
  generateRandomSeed,
  getRandomInt,
  imagePromptBuilder,
  muscleMapping,
  negativeImagePromptBuilder,
  weightMapping,
} from 'Util/util'
import { Character } from 'character-forge'
import fs from 'fs'
import Application from '@ioc:Adonis/Core/Application'
import Config from '@ioc:Adonis/Core/Config'

export default class ComfyUiService {
  private static instance: ComfyUiService
  private static readonly API_URL = Env.get('COMFY_UI_API_URL')
  private static readonly model = Config.get('app.comfyUi.model')
  private static readonly maxAttempts = Config.get('app.comfyUi.maxAttempts')

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
      Logger.error(error, "Error retrieving the image's history.")
    }
  }

  public async getImages(history: {}, promptId: string, uid: string) {
    try {
      const defaultImage = history[promptId].outputs['35'].images[0]

      for (const image of [defaultImage]) {
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
      Logger.error(error, 'Error retrieving the image.')
    }
  }

  public async sendPrompt(character: Character, uid: string) {
    try {
      const randomSeed = generateRandomSeed(
        `${character.name}+${character.surname}+${character.age}`
      )
      const prompt = imagePromptBuilder(character)
      const negativePrompt = negativeImagePromptBuilder(character.sex)
      const age = characterAgeMapping(character.age)
      const sex = characterSexMapping(character.sex)
      const breastSize = breastSizeMapping(character.sex, character.bodyType.type)
      const muscle = muscleMapping(character.bodyType.type)
      const weight = weightMapping(character.bodyType.type)
      const details = getRandomInt(-1, 1.5)
      const artifactLevel = getRandomInt(50, 100)
      const noiseLevel = getRandomInt(1, 20)

      const payload = {
        prompt: {
          '1': {
            inputs: {
              ckpt_name: ComfyUiService.model,
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
              clip: ['57', 1],
            },
            class_type: 'CLIPTextEncode',
            _meta: {
              title: 'CLIP Text Encode (Prompt)',
            },
          },
          '4': {
            inputs: {
              text: `embedding:CyberRealistic_Negative-neg, ${negativePrompt}`,
              clip: ['57', 1],
            },
            class_type: 'CLIPTextEncode',
            _meta: {
              title: 'CLIP Text Encode (Prompt)',
            },
          },
          '5': {
            inputs: {
              seed: randomSeed,
              steps: 8,
              cfg: 1.3,
              sampler_name: 'lcm',
              scheduler: 'normal',
              denoise: 1,
              model: ['57', 0],
              positive: ['3', 0],
              negative: ['4', 0],
              latent_image: ['6', 0],
            },
            class_type: 'KSampler',
            _meta: {
              title: 'KSampler',
            },
          },
          '6': {
            inputs: {
              width: 512,
              height: 768,
              batch_size: 1,
            },
            class_type: 'EmptyLatentImage',
            _meta: {
              title: 'Empty Latent Image',
            },
          },
          '7': {
            inputs: {
              samples: ['5', 0],
              vae: ['38', 0],
            },
            class_type: 'VAEDecode',
          },
          '35': {
            inputs: {
              filename_prefix: uid,
              images: ['54', 0],
            },
            class_type: 'SaveImage',
          },
          '38': {
            inputs: {
              vae_name: 'vae-ft-mse-840000-ema-pruned.safetensors',
            },
            class_type: 'VAELoader',
          },
          '54': {
            inputs: {
              jpeg_artifact_level: artifactLevel,
              noise_level: noiseLevel,
              adjust_brightness: 1,
              adjust_color: 1,
              adjust_contrast: 1,
              seed: 871038986630641,
              pixels: ['7', 0],
            },
            class_type: 'Dequality',
            _meta: {
              title: 'Dequality',
            },
          },
          '57': {
            inputs: {
              lora_name: 'ReaLora.safetensors',
              strength_model: 0.7,
              strength_clip: 0.7,
              model: ['72', 0],
              clip: ['72', 1],
            },
            class_type: 'LoraLoader',
            _meta: {
              title: 'Load LoRA',
            },
          },
          '67': {
            inputs: {
              lora_name: 'weight_slider_v2.safetensors',
              strength_model: weight,
              strength_clip: weight,
              model: ['2', 0],
              clip: ['2', 1],
            },
            class_type: 'LoraLoader',
            _meta: {
              title: 'Weight Slider',
            },
          },
          '68': {
            inputs: {
              lora_name: 'gender_slider_v1.safetensors',
              strength_model: sex,
              strength_clip: sex,
              model: ['73', 0],
              clip: ['73', 1],
            },
            class_type: 'LoraLoader',
            _meta: {
              title: 'Gender Slider',
            },
          },
          '69': {
            inputs: {
              lora_name: 'muscle_slider_v1.safetensors',
              strength_model: muscle,
              strength_clip: muscle,
              model: ['68', 0],
              clip: ['68', 1],
            },
            class_type: 'LoraLoader',
            _meta: {
              title: 'Muscle Slider',
            },
          },
          '70': {
            inputs: {
              lora_name: 'detail_slider_v4.safetensors',
              strength_model: details,
              strength_clip: details,
              model: ['69', 0],
              clip: ['69', 1],
            },
            class_type: 'LoraLoader',
            _meta: {
              title: 'Detail Slider',
            },
          },
          '71': {
            inputs: {
              lora_name: 'skin_tone_slider_v1.safetensors',
              strength_model: 0,
              strength_clip: 0,
              model: ['70', 0],
              clip: ['70', 1],
            },
            class_type: 'LoraLoader',
            _meta: {
              title: 'Skin Tone Slider',
            },
          },
          '72': {
            inputs: {
              lora_name: 'breastsizeslideroffset.safetensors',
              strength_model: breastSize,
              strength_clip: breastSize,
              model: ['71', 0],
              clip: ['71', 1],
            },
            class_type: 'LoraLoader',
            _meta: {
              title: 'Breast Size Slider',
            },
          },
          '73': {
            inputs: {
              lora_name: 'age_slider-LECO-v1.safetensors',
              strength_model: age,
              strength_clip: age,
              model: ['67', 0],
              clip: ['67', 1],
            },
            class_type: 'LoraLoader',
            _meta: {
              title: 'Age Slider',
            },
          },
        },
      }

      const response = await axios.post(`${ComfyUiService.API_URL}/prompt`, payload)
      Logger.info('Prompt sent.')
      if (response.status == 200) {
        const promptId = response.data.prompt_id

        let history = {}
        let attempts = 0

        while (Object.keys(history).length === 0 && attempts < ComfyUiService.maxAttempts) {
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
      Logger.error(error, 'Error generating image: ')
    }
  }
}
