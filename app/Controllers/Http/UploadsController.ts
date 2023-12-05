import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Drive from '@ioc:Adonis/Core/Drive'

export default class UploadsController {
  public async show({ params, response }: HttpContextContract) {
    const fileExists = await Drive.exists(params.filename)

    if (!fileExists) {
      return response.status(404).send('File not found')
    }

    return await Drive.getSignedUrl(params.filename)
  }
}
