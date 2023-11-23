import { BaseTask, CronTimeV2 } from 'adonis5-scheduler/build/src/Scheduler/Task'
import SwipeService from '../../services/swipe_service'

export default class SwipeCheckerTask extends BaseTask {
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
    // Remove this promise and insert your code:
    await new Promise(() => {
      SwipeService.getInstance().checkSwipes()
      this.logger.info('Checked swipes.')
    })
  }
}
