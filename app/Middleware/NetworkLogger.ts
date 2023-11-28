import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class NetworkLogger {
  public async handle({ request, logger }: HttpContextContract, next: () => Promise<void>) {
    logger.info(`${request.method()} ${request.url()}`)

    if (request.hasBody()) {
      logger.info(JSON.stringify(request.body()))
    }

    await next()
  }
}
