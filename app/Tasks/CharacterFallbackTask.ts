import CharacterFallbackService from 'Service/CharacterFallbackService'
import { BaseTask, CronTimeV2 } from 'adonis5-scheduler/build/src/Scheduler/Task'

export default class CharacterFallbackTask extends BaseTask {
  characterFallbackService: CharacterFallbackService

  public static get schedule() {
		// Use CronTimeV2 generator:
    return CronTimeV2.everyTenMinutes()
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
    this.characterFallbackService = new CharacterFallbackService()
    await new Promise(() => {
      this.characterFallbackService.checkCharacters()
      this.logger.info(`Character fallback check.`)
    })
  }
}
