import { BaseTask } from 'adonis5-scheduler/build/src/Scheduler/Task'
import SuspensionService from 'Service/SuspensionService'
import Config from '@ioc:Adonis/Core/Config'

export default class SuspensionCheckerTask extends BaseTask {
  suspensionService: SuspensionService

  public static get schedule() {
    // Use CronTimeV2 generator:
    return Config.get('app.tasks.suspensionChecker.cronTime')
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
    if (Config.get('app.tasks.suspensionChecker.enabled')) {
      this.suspensionService = new SuspensionService()
      await new Promise(() => {
        this.suspensionService.checkSuspensions()
        this.logger.info('Checked suspensions.')
      })
    }
  }
}
