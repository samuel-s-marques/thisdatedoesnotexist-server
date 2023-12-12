import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import Env from '@ioc:Adonis/Core/Env'
import * as OneSignal from '@onesignal/node-onesignal'

/*
|--------------------------------------------------------------------------
| Provider
|--------------------------------------------------------------------------
|
| Your application is not ready when this file is loaded by the framework.
| Hence, the top level imports relying on the IoC container will not work.
| You must import them inside the life-cycle methods defined inside
| the provider class.
|
| @example:
|
| public async ready () {
|   const Database = this.app.container.resolveBinding('Adonis/Lucid/Database')
|   const Event = this.app.container.resolveBinding('Adonis/Core/Event')
|   Event.on('db:query', Database.prettyPrint)
| }
|
*/
export default class OneSignalProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    this.app.container.singleton('Adonis/Addons/OneSignal', (_) => {
      const configuration = OneSignal.createConfiguration({
        authMethods: {
          app_key: {
            tokenProvider: Env.get('ONESIGNAL_APP_KEY'),
          },
        },
      })

      return new OneSignal.DefaultApi(configuration)
    })

    this.app.aliasesMap.set('Adonis/Addons/OneSignal', 'OneSignal')
  }

  public async boot() {
    // All bindings are ready, feel free to use them
  }

  public async ready() {
    // App is ready
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
