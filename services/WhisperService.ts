import Logger from '@ioc:Adonis/Core/Logger'
import shell from 'shelljs'
import path from 'path'
import fs from 'fs';
import { platform } from 'node:process';
import Config from '@ioc:Adonis/Core/Config';

export default class WhisperService {
  private static instance: WhisperService
  private static readonly MODEL_NAME = Config.get('app.whisper.model')

  public static getInstance(): WhisperService {
    if (!WhisperService.instance) {
      WhisperService.instance = new WhisperService()
    }

    return WhisperService.instance
  }

  public async getTranscription(file: string) {
    try {
      if (!file || file == '') {
        Logger.error('The file path is empty')
        return null
      }

      const filepath: string = path.normalize(file)
      const modelName = WhisperService.MODEL_NAME
      const modelFullName = `models/ggml-${modelName}.bin`

      if (!fs.existsSync(`whisper\\${modelFullName}`)) {
        Logger.error(`The model file does not exist: ${modelFullName}`)
        return null
      }

      const main = platform === 'win32' ? 'main.exe' : './main'
      const transcript = await this.command(
        `${main} -l auto -nt -t 8 -m ${modelFullName} -f ${filepath}`
      )

      if (!transcript || transcript == '') {
        return null
      }

      return transcript
        .toString()
        .trim()
        .replace(/\[.*?\]/g, '')
    } catch (error) {
      Logger.error(error, 'Error retrieving the transcription.')
    }
  }

  private async command(command: string) {
    if (!shell.pwd().stdout.includes('whisper')) {
      shell.cd('whisper')
    }

    return new Promise(async (resolve, reject) => {
      try {
        shell.exec(command, { silent: true }, (code, stdout, stderr) => {
          if (code === 0) {
            resolve(stdout)
          } else {
            reject(stderr)
          }

          if (shell.pwd().stdout.includes('whisper')) {
            shell.cd('..')
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  }
}
