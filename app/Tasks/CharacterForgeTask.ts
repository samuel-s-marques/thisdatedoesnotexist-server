import UsersController from 'App/Controllers/Http/UsersController'
import { BaseTask } from 'adonis5-scheduler/build/src/Scheduler/Task'
import Config from '@ioc:Adonis/Core/Config'

export default class CharacterForgeTask extends BaseTask {
  characterController: UsersController

  public static get schedule() {
    // Use CronTimeV2 generator:
    return Config.get('app.tasks.characterForge.cronTime')
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
    if (Config.get('app.tasks.characterForge.enabled')) {
      this.characterController = new UsersController()
      await new Promise(() => {
        this.characterController.storeCharacter()
        this.logger.info('Character created.')
      })
    }
  }
}
