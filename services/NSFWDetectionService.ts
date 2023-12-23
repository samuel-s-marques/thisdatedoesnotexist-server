import fs from 'fs'
import path from 'path'
import tf = require('@tensorflow/tfjs-node-gpu')
import { NSFWJS } from 'nsfwjs'
import Logger from '@ioc:Adonis/Core/Logger'
import sharp = require('sharp')
const jpeg = require('jpeg-js')

export default class NSFWDetectionService {
  private static instance: NSFWDetectionService
  model = 'inception'
  baseUrl = 'assets/nsfw_models/'
  nsfw: NSFWJS

  constructor() {
    const modelPath = `${this.baseUrl}${this.model}/`

    tf.env().set('PROD', true)
    tf.enableProdMode()

    this.nsfw = new NSFWJS(modelPath, {
      size: 299,
    })
    this.overrideLoad(this.nsfw, modelPath)
    this.initializeNSFW()
  }

  public async initializeNSFW() {
    await tf.ready()
    await this.nsfw.load()
  }

  public static async getInstance(): Promise<NSFWDetectionService> {
    if (!NSFWDetectionService.instance) {
      NSFWDetectionService.instance = new NSFWDetectionService()
    }

    return NSFWDetectionService.instance
  }

  private overrideLoad(context: NSFWJS, modelBaseUrl: string) {
    context.load = async function nsfwOverrideLoad() {
      const { size, type } = this.options
      const pathOrIoHandler = this.pathOrIOHandler
      const loadOptions = {
        onProgress: (fraction: number) => {
          {
            Logger.info(`Model load progress: ${(fraction * 100).toFixed(1)}%`)
          }
        },
        async fetchFunc(fpath: string) {
          let curPath = fpath
          if (!fs.existsSync(curPath)) {
            curPath = path.resolve(modelBaseUrl, './' + fpath)
          }

          Logger.info('Model load file: ' + fpath, curPath)
          const { Response: fetchResponse } = await import('node-fetch')
          return await new Promise((resolve, reject) => {
            fs.readFile(curPath, (err, data) => {
              if (err) {
                reject(err)
                return
              }

              resolve(new fetchResponse(data))
            })
          })
        },
      }

      if (type === 'graph') {
        this.model = await tf.loadGraphModel(pathOrIoHandler, loadOptions as any)
      } else {
        this.model = await tf.loadLayersModel(pathOrIoHandler, loadOptions as any)
        this.endpoints = this.model.layers.map((l) => l.name)
      }

      const result = tf.tidy(() => this.model.predict(tf.zeros([1, size, size, 3])))
      await result.data()
      result.dispose()
    }
  }

  private async convertToTensor(imagePath: string) {
    const imageBuffer = fs.readFileSync(imagePath)
    const convertedImageBuffer = await sharp(imageBuffer).resize(299, 299).jpeg().toBuffer()
    const decodedJpeg = jpeg.decode(convertedImageBuffer)
    const { width, height, data } = decodedJpeg
    const buffer = new Uint8Array(width * height * 3)
    let offset = 0
    for (let i = 0; i < buffer.length; i += 3) {
      buffer[i] = data[offset]
      buffer[i + 1] = data[offset + 1]
      buffer[i + 2] = data[offset + 2]

      offset += 4
    }

    return tf.tensor3d(buffer, [height, width, 3], 'int32')
  }

  public async classify(imagePath: string) {
    const image = await this.convertToTensor(imagePath)
    const predictions = await this.nsfw.classify(image, 5)
    image.dispose()

    return predictions
  }
}
