import CharacterFallbackService from 'Service/CharacterFallbackService'
import { BaseTask } from 'adonis5-scheduler/build/src/Scheduler/Task'
import Config from '@ioc:Adonis/Core/Config'

export default class CharacterFallbackTask extends BaseTask {
  characterFallbackService: CharacterFallbackService

  public static get schedule() {
    // Use CronTimeV2 generator:
    return Config.get('app.tasks.characterFallback.cronTime')
    // or just use return cron-style string (simple cron editor: crontab.guru)
  }
  /**
   * Set enable use .lock file for block run retry task
   * Lock file save to `build/tmp/adonis5-scheduler/locks/your-class-name`
   */
  public static get useLock() {
    return false
  }

  public async handle() {
    if (Config.get('app.tasks.characterFallback.enabled')) {
      this.characterFallbackService = new CharacterFallbackService()
      await new Promise(() => {
        this.characterFallbackService.checkCharacters()
        this.logger.info(`Character fallback check.`)
      })
    }
  }
}
