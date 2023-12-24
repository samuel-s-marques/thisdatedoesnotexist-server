import { BaseTask, CronTimeV2 } from 'adonis5-scheduler/build/src/Scheduler/Task'
import AutoSwipeService from 'Service/AutoSwipeService'

export default class AutoSwipeTask extends BaseTask {
  autoSwipeService: AutoSwipeService

  public static get schedule() {
    // Use CronTimeV2 generator:
    return CronTimeV2.everyHour()
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
    this.autoSwipeService = new AutoSwipeService()
    await new Promise(() => {
      this.autoSwipeService.swipeProfiles()
      this.logger.info('AutoSwipe completed.')
    })
  }
}
