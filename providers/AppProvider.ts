import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import Application from '@ioc:Adonis/Core/Application'
import NSFWDetectionService from 'Service/NSFWDetectionService'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    // Register your own bindings
  }

  public async boot() {
    // IoC container is ready
  }

  public async ready() {
    const scheduler = Application.container.use('Adonis/Addons/Scheduler')
    scheduler.run()
    await import('../start/socket')
    await NSFWDetectionService.getInstance()
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
