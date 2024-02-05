import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Report from 'App/Models/Report'
import User from 'App/Models/User'
import { findMostCommonString } from 'Util/util'
import { DateTime } from 'luxon'

export default class ReportsController {
  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)

    const user = await User.findByOrFail('uid', request.token.uid)
    const reports = await Report.query()
      .where('user_id', user.id)
      .preload('character')
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
        return response.status(409).json({
          error: {
            code: 409,
            message: 'Conflict',
            details: 'Report already exists.',
          },
        })
      }

      const report = new Report()
      report.type = type
      report.description = description
      report.status = 'pending'
      await report.related('user').associate(user)
      await report.related('character').associate(character)
      await report.save()

      character.reportsCount++
      await character.save()

      if (
        character.reportsCount >= 10 &&
        character.reportsCount < 20 &&
        character.status !== 'suspended' &&
        character.status !== 'banned'
      ) {
        const reports = await Report.query().where('character_id', character.id)
        const types = reports.map((report) => report.type)
        const commonReason = findMostCommonString(types)

        character.status = 'suspended'
        character.statusReason = commonReason!

        if (character.statusUntil === null) {
          character.statusUntil = DateTime.now().plus({ days: 5 })
        }

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

      return response.status(201).send(report)
    } catch (error) {
      return response.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: `Error creating report: ${error.message}`,
        },
      })
    }
  }
}
