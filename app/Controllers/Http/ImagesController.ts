import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { v4 as uuidv4 } from 'uuid'
import Application from '@ioc:Adonis/Core/Application'
import fs from 'fs'
import NSFWDetectionService from 'Service/NSFWDetectionService'

export default class ImagesController {
  public async store({ request, response }: HttpContextContract) {
    const nsfwService = await NSFWDetectionService.getInstance()

    const profileImage = request.file('profile_image', {
      size: '2mb',
      extnames: ['jpg', 'png', 'jpeg'],
    })

    if (!profileImage) {
      return response.status(400).json({ error: 'No file provided' })
    }

    if (!profileImage.isValid) {
      return response.status(400).json({ error: profileImage.errors })
    }

    const imageName = uuidv4() + '.' + profileImage.extname
    await profileImage.move(Application.tmpPath('uploads'), {
      name: imageName,
      overwrite: true,
    })

    const imagePath = Application.tmpPath('uploads', imageName)
    const predictions = await nsfwService.classify(imagePath)
    const isNsfw = predictions.find(
      (prediction) => prediction.className === 'Porn' && prediction.probability > 0.6
    )
    fs.unlinkSync(imagePath)

    if (isNsfw) {
      return response.status(400).json({ error: 'NSFW image' })
    }

    return response.send({ success: true })
  }
}
