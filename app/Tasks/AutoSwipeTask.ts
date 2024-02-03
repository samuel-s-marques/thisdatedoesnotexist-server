import { BaseTask } from 'adonis5-scheduler/build/src/Scheduler/Task'
import AutoSwipeService from 'Service/AutoSwipeService'
import Config from '@ioc:Adonis/Core/Config'

export default class AutoSwipeTask extends BaseTask {
  autoSwipeService: AutoSwipeService

  public static get schedule() {
    // Use CronTimeV2 generator:
    return Config.get('app.tasks.autoSwipe.cronTime')
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
    if (Config.get('app.tasks.autoSwipe.enabled')) {
      this.autoSwipeService = new AutoSwipeService()
      await new Promise(() => {
        this.autoSwipeService.swipeProfiles()
        this.logger.info('AutoSwipe completed.')
      })
    }
  }
}
