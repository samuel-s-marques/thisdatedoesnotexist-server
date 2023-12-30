import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Report from 'App/Models/Report'
import User from 'App/Models/User'
import { findMostCommonString } from 'Util/util'

export default class ReportsController {
  public async index({ request, response }: HttpContextContract) {
    const page = request.input('page', 1)
    const uid = request.input('uid')

    if (!uid) {
      return response.status(400).json({ error: 'User ID is required.' })
    }

    const user = await User.findByOrFail('uid', uid)
    const reports = await Report.query()
      .where('user_id', user.id)
      .preload('user')
      .paginate(page, 40)
    return reports
  }

  public async show({ params }: HttpContextContract) {
    const report = await Report.query().where('id', params.id).preload('character').firstOrFail()

    return report
  }

  public async store({ request, response }: HttpContextContract) {
    try {
      const { user_uid, character_uid, description, type } = request.all()

      const user = await User.findByOrFail('uid', user_uid)
      const character = await User.findByOrFail('uid', character_uid)

      const existingReport = await Report.query()
        .where('user_id', user.id)
        .andWhere('character_id', character.id)
        .first()

      if (existingReport) {
        return response.status(400).json({ error: 'Report already exists.' })
      }

      const report = new Report()
      report.type = type
      report.description = description
      await report.related('user').associate(user)
      await report.related('character').associate(character)
      await report.save()

      character.reportsCount++
      await character.save()

      if (character.reportsCount >= 10 && character.status !== 'suspended') {
        const reports = await Report.query().where('character_id', character.id)
        const types = reports.map((report) => report.type)
        const commonReason = findMostCommonString(types)

        character.status = 'suspended'
        character.statusReason = commonReason!
        await character.save()
      }

      if (character.reportsCount >= 20 && character.status !== 'banned') {
        const reports = await Report.query().where('character_id', character.id)
        const types = reports.map((report) => report.type)
        const commonReason = findMostCommonString(types)

        character.status = 'banned'
        character.statusReason = commonReason!
        await character.save()
      }

      return report
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }
}
