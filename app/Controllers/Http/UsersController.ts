import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BodyType from 'App/Models/BodyType'
import HobbyModel from 'App/Models/HobbyModel'
import Match from 'App/Models/Match'
import PoliticalView from 'App/Models/PoliticalView'
import Preference from 'App/Models/Preference'
import RelationshipGoal from 'App/Models/RelationshipGoal'
import Sex from 'App/Models/Sex'
import Swipe from 'App/Models/Swipe'
import User from 'App/Models/User'
import admin from 'firebase-admin'

export default class UsersController {
  public async index(ctx: HttpContextContract) {
    const page = ctx.request.input('page', 1)

    const users = await User.query()
      .preload('hobbies')
      .preload('preferences', (query) => {
        query
          .preload('bodyTypes')
          .preload('politicalViews')
          .preload('relationshipGoals')
          .preload('sexes')
      })
      .paginate(page, 40)

    return users
  }

  public async show(ctx: HttpContextContract) {
    const token = ctx.request.header('Authorization')!.split(' ')[1]
    const decodedToken = await admin.auth().verifyIdToken(token)
    const uid = ctx.params.uid

    if (uid != decodedToken.uid) {
      return ctx.response.status(400).json({ error: 'User does not exist.' })
    }

    const user = await User.query()
      .where('uid', decodedToken.uid)
      .preload('hobbies')
      .preload('preferences', (query) => {
        query
          .preload('bodyTypes')
          .preload('politicalViews')
          .preload('relationshipGoals')
          .preload('sexes')
      })
      .firstOrFail()

    return user
  }

  public async store(ctx: HttpContextContract) {
    try {
      const token = ctx.request.header('Authorization')!.split(' ')[1]
      const decodedToken = await admin.auth().verifyIdToken(token)
      const existingUser = await User.findBy('uid', decodedToken.uid)

      if (existingUser) {
        return ctx.response.status(400).json({ error: 'User already exists' })
      }

      const newUser = new User()
      const data = ctx.request.only([
        'name',
        'email',
        'age',
        'sex',
        'bio',
        'weight',
        'height',
        'surname',
        'birthday_date',
        'hobbies',
        'religion',
        'country',
        'political_view',
        'relationship_goal',
        'preferences',
      ])

      let filteredData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v != null))
      newUser.fill({
        uid: decodedToken.uid,
        ...filteredData,
      })
      const user = await newUser.save()

      if (filteredData.hobbies) {
        const filteredHobbies = filteredData.hobbies.map(
          (hobby: { name: string; type: string }) => hobby.name
        )
        const hobbies = await HobbyModel.query().whereIn('name', filteredHobbies)
        user.related('hobbies').attach(hobbies.map((hobby) => hobby.id))
      }

      if (filteredData.preferences) {
        const filteredPreferences = filteredData.preferences
        const preference = new Preference()

        if (filteredPreferences.min_age) {
          preference.minAge = filteredData.preferences.min_age
        }

        if (filteredPreferences.max_age) {
          preference.maxAge = filteredData.preferences.max_age
        }
        await preference.related('user').associate(user)
        const createdPreference = await preference.save()

        if (filteredPreferences.body_types.length != 0) {
          const bodyTypes = await BodyType.query().whereIn('name', filteredPreferences.body_types)
          createdPreference.related('bodyTypes').attach(bodyTypes.map((bodyType) => bodyType.id))
        }

        if (filteredPreferences.political_views.length != 0) {
          const politicalViews = await PoliticalView.query().whereIn(
            'name',
            filteredPreferences.political_views
          )
          createdPreference.related('politicalViews').attach(politicalViews.map((view) => view.id))
        }

        if (filteredPreferences.sexes.length != 0) {
          const sexes = await Sex.query().whereIn('name', filteredPreferences.sexes)
          createdPreference.related('sexes').attach(sexes.map((sex) => sex.id))
        }

        if (filteredPreferences.relationship_goals.length != 0) {
          const goals = await RelationshipGoal.query().whereIn(
            'name',
            filteredPreferences.relationship_goals
          )
          createdPreference.related('relationshipGoals').attach(goals.map((goal) => goal.id))
        }
        console.log(preference)
      }

      return user
    } catch (error) {
      return ctx.response.status(400).json({ error: 'Error creating user' })
    }
  }

  public async update(ctx: HttpContextContract) {
    try {
      const token = ctx.request.header('Authorization')!.split(' ')[1]
      const decodedToken = await admin.auth().verifyIdToken(token)

      const user = await User.findBy('uid', decodedToken.uid)

      if (!user) {
        return ctx.response.status(400).json({ error: 'User does not exist.' })
      }

      const data = ctx.request.only([
        'name',
        'email',
        'age',
        'sex',
        'bio',
        'weight',
        'height',
        'surname',
        'birthday_date',
        'hobbies',
        'religion',
        'country',
        'political_view',
        'relationship_goal',
        'preferences',
      ])
      let filteredData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v != null))
      user.merge(filteredData)

      if (filteredData.hobbies) {
        const filteredHobbies = filteredData.hobbies.map(
          (hobby: { name: string; type: string }) => hobby.name
        )
        const hobbies = await HobbyModel.query().whereIn('name', filteredHobbies)
        // user.related('hobbies').attach(hobbies.map((hobby) => hobby.id))
      }

      if (filteredData.preferences) {
        const filteredPreferences = filteredData.preferences
        const preference = new Preference()

        if (filteredPreferences.min_age) {
          preference.minAge = filteredData.preferences.min_age
        }

        if (filteredPreferences.max_age) {
          preference.maxAge = filteredData.preferences.max_age
        }

        if (filteredPreferences.body_types.length != 0) {
          const bodyTypes = await BodyType.query().whereIn('name', filteredPreferences.body_types)
          preference.related('bodyTypes').attach(bodyTypes.map((bodyType) => bodyType.id))
        }

        if (filteredPreferences.political_views.length != 0) {
          const politicalViews = await PoliticalView.query().whereIn(
            'name',
            filteredPreferences.political_views
          )
          preference.related('politicalViews').attach(politicalViews.map((view) => view.id))
        }

        if (filteredPreferences.sexes.length != 0) {
          const sexes = await Sex.query().whereIn('name', filteredPreferences.sexes)
          preference.related('sexes').attach(sexes.map((sex) => sex.id))
        }

        if (filteredPreferences.relationship_goals.length != 0) {
          const goals = await RelationshipGoal.query().whereIn(
            'name',
            filteredPreferences.relationship_goals
          )
          preference.related('relationshipGoals').attach(goals.map((goal) => goal.id))
        }

        // preference.save()
        console.log(preference)
        await preference.related('user').associate(user)
      }

      console.log(user)

      // await user.save()
    } catch (error) {
      return ctx.response.status(400).json({ error: 'Error updating user' })
    }
  }

  public async destroy(ctx: HttpContextContract) {
    try {
      const token = ctx.request.header('Authorization')!.split(' ')[1]
      const decodedToken = await admin.auth().verifyIdToken(token)

      const user = await User.findBy('uid', decodedToken.uid)

      if (!user) {
        return ctx.response.status(400).json({ error: 'User does not exist.' })
      }

      user.delete()
      Match.query().where('user_id', user.id).delete()
      Swipe.query().where('swiper_id', user.id).orWhere('target_id', user.id).delete()

      return ctx.response.status(200).json({ message: 'User deleted.' })
    } catch (error) {
      return ctx.response.status(400).json({ error: 'Error deleting user' })
    }
  }
}
