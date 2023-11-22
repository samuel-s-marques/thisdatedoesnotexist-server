import CharactersController from 'App/Controllers/Http/CharactersController'
import { BaseTask, CronTimeV2 } from 'adonis5-scheduler/build/src/Scheduler/Task'

export default class CharacterForgeTask extends BaseTask {
  characterController: CharactersController

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
    this.characterController = new CharactersController()
    await new Promise(() => {
      this.characterController.store()
      this.logger.info('Character created.')
    })
  }
}
