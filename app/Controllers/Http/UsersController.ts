import Application from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BodyType from 'App/Models/BodyType'
import HobbyModel from 'App/Models/HobbyModel'
import PoliticalView from 'App/Models/PoliticalView'
import Preference from 'App/Models/Preference'
import RelationshipGoal from 'App/Models/RelationshipGoal'
import Sex from 'App/Models/Sex'
import User from 'App/Models/User'
import admin from 'firebase-admin'
import { v4 as uuidv4 } from 'uuid'
import Drive from '@ioc:Adonis/Core/Drive'
import { AgesModule, CharacterForge } from 'character-forge'
import PersonalityTraitModel from 'App/Models/PersonalityTraitModel'
import PronounsModel from 'App/Models/PronounsModel'
import ComfyUiService from 'Service/ComfyUiService'
import KoboldService from 'Service/KoboldService'
import Env from '@ioc:Adonis/Core/Env'
import NSFWDetectionService from 'Service/NSFWDetectionService'
import fs from 'fs'
import ProfileSuggesterService from 'Service/ProfileSuggesterService'

const textGenApi = new KoboldService()
const profileSuggesterService = new ProfileSuggesterService()

export default class UsersController {
  public async index(ctx: HttpContextContract) {
    const page = ctx.request.input('page', 1)
    const searchQuery = ctx.request.qs()

    const user = await User.query()
      .where('uid', searchQuery.uid)
      .preload('hobbies')
      .preload('relationshipGoal')
      .firstOrFail()

    const characters = await User.query()
      .preload('hobbies')
      .preload('pronoun')
      .preload('relationshipGoal')
      .preload('personalityTraits')
      .where('type', 'character')
      .whereNotIn('id', function (query) {
        query.select('target_id').from('swipes').where('swiper_id', user.id)
      })
      .andWhere('id', '<>', user.id)
      .andWhere('status', 'normal')
      .if(searchQuery.sex, (query) => {
        query.whereIn('sex', searchQuery.sex.split(','))
      })
      .if(searchQuery.sexuality, (query) => {
        query.whereIn('sexuality', searchQuery.sexuality.split(','))
      })
      .if(searchQuery.body_type, (query) => {
        query.whereIn('body_type', searchQuery.body_type.split(','))
      })
      .if(searchQuery.political_view, (query) => {
        query.whereIn('political_view', searchQuery.political_view.split(','))
      })
      .if(searchQuery.religion, (query) => {
        query.whereIn('religion', searchQuery.religion.split(','))
      })
      .if(searchQuery.relationship_goal, (query) => {
        query.whereIn('relationship_goal', searchQuery.relationship_goal.split(','))
      })
      .if(searchQuery.min_age && searchQuery.max_age, (query) => {
        query.whereBetween('age', [searchQuery.min_age, searchQuery.max_age])
      })
      .paginate(page, searchQuery.per_page ?? 20)

    const charactersJson = characters.toJSON()
    const response = await profileSuggesterService.getProfilesFromApi(user, charactersJson.data)

    if (response.status != 200) {
      return ctx.response.status(400).json({ error: 'Error getting profiles from API' })
    }

    const profiles = response.data.suggested_profiles

    return {
      meta: {
        total: characters.total,
        per_page: searchQuery.per_page ?? 20,
        current_page: page,
        last_page: characters.lastPage,
        first_page: characters.firstPage,
        first_page_url: `/?page=1`,
        last_page_url: `/?page=${characters.lastPage}`,
        next_page_url: characters.getNextPageUrl(),
        previous_page_url: characters.getPreviousPageUrl(),
      },
      data: profiles,
    }
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
      .preload('pronoun')
      .preload('relationshipGoal')
      .preload('preferences', (query) => {
        query
          .preload('body_types')
          .preload('political_views')
          .preload('relationship_goals')
          .preload('sexes')
      })
      .firstOrFail()

    return user
  }

  public async showCharacter(ctx: HttpContextContract) {
    const user = await User.query()
      .where('uid', ctx.params.uuid)
      .preload('hobbies')
      .preload('pronoun')
      .preload('relationshipGoal')
      .preload('personalityTraits')
      .firstOrFail()

    return user
  }

  public async store({ request, response }: HttpContextContract) {
    try {
      const token = request.header('Authorization')!.split(' ')[1]
      const decodedToken = await admin.auth().verifyIdToken(token)
      const existingUser = await User.findBy('uid', decodedToken.uid)

      if (existingUser) {
        return response.status(400).json({ error: 'User already exists' })
      }

      const newUser = new User()
      const data = request.only([
        'name',
        'email',
        'age',
        'sex',
        'bio',
        'weight',
        'height',
        'surname',
        'hobbies',
        'religion',
        'occupation',
        'country',
        'active',
        'political_view',
        'relationship_goal',
        'pronoun',
        'preferences',
      ])

      const profileImage = request.file('profile_image', {
        size: '2mb',
        extnames: ['jpg', 'png', 'jpeg'],
      })

      if (!profileImage) {
        return response.status(400).json({ error: 'Profile image is required' })
      }

      if (!profileImage.isValid) {
        return response.status(400).json({ error: profileImage.errors })
      }

      const imageName = uuidv4() + '.' + profileImage.extname
      await profileImage.move(Application.publicPath('uploads'), {
        name: imageName,
        overwrite: true,
      })

      let filteredData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v != null))

      if (!filteredData.email) {
        filteredData.email = decodedToken.email
      }

      filteredData.active = true

      const pronoun = await PronounsModel.findOrFail(filteredData.pronoun.id)
      const relationshipGoal = await RelationshipGoal.findOrFail(filteredData.relationship_goal.id)

      if (filteredData.hasOwnProperty('relationship_goal')) {
        delete filteredData['relationship_goal']
      }

      if (filteredData.hasOwnProperty('pronoun')) {
        delete filteredData['pronoun']
      }

      newUser.fill({
        uid: decodedToken.uid,
        imageUrl: `/uploads/${imageName}`,
        type: 'user',
        status: 'normal',
        ...filteredData,
      })

      await newUser.related('pronoun').associate(pronoun)
      await newUser.related('relationshipGoal').associate(relationshipGoal)

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
        const body_types = filteredPreferences.body_types ?? []
        const political_views = filteredPreferences.political_views ?? []
        const sexes = filteredPreferences.sexes ?? []
        const relationship_goals = filteredPreferences.relationship_goals ?? []

        if (filteredPreferences.min_age) {
          preference.minAge = filteredData.preferences.min_age
        }

        if (filteredPreferences.max_age) {
          preference.maxAge = filteredData.preferences.max_age
        }
        await preference.related('user').associate(user)
        const createdPreference = await preference.save()

        if (body_types.length != 0) {
          createdPreference
            .related('body_types')
            .attach(
              filteredPreferences.body_types.map(
                (bodyType: { id: number; name: string }) => bodyType.id
              )
            )
        }

        if (political_views.length != 0) {
          createdPreference
            .related('political_views')
            .attach(
              filteredPreferences.political_views.map(
                (view: { id: number; name: string }) => view.id
              )
            )
        }

        if (sexes.length != 0) {
          createdPreference
            .related('sexes')
            .attach(filteredPreferences.sexes.map((sex: { id: number; name: string }) => sex.id))
        }

        if (relationship_goals.length != 0) {
          createdPreference
            .related('relationship_goals')
            .attach(
              filteredPreferences.relationship_goals.map(
                (sex: { id: number; name: string }) => sex.id
              )
            )
        }
      }

      return user
    } catch (error) {
      console.log(error)
      return response.status(400).json({ error: 'Error creating user', message: error })
    }
  }

  public async storeCharacter() {
    const forge: CharacterForge = new CharacterForge()
    const ageModule: AgesModule = new AgesModule()
    let forgedCharacter = forge.forge()
    const forgedPersonalityTraits = forgedCharacter.personalityTraits.map((trait) => trait.name)
    const forgedHobbies = forgedCharacter.hobbies.map((hobby) => hobby.name)
    forgedCharacter.age = ageModule.getRandomAge(18, 70)

    let character: User = new User()
    character.uid = uuidv4()
    character.name = forgedCharacter.name
    character.nickname = forgedCharacter.nickname ? forgedCharacter.nickname : null
    character.surname = forgedCharacter.surname
    character.age = forgedCharacter.age
    character.sex = forgedCharacter.sex
    character.sexuality = forgedCharacter.sexuality.sexuality
    character.bodyType = forgedCharacter.bodyType.type
    character.height = forgedCharacter.bodyType.height
    character.weight = forgedCharacter.bodyType.weight
    character.skinTone = forgedCharacter.skinTone
    character.hairStyle = forgedCharacter.hairStyle
    character.occupation = forgedCharacter.occupation
    character.country = forgedCharacter.birthplace
    character.ethnicity = forgedCharacter.ethnicity
    character.eyeColor = forgedCharacter.eyeColor
    character.hairColor = forgedCharacter.hairColor
    character.religion = forgedCharacter.religion
    character.socialClass = forgedCharacter.socialClass
    character.politicalView = forgedCharacter.politicalView
    character.phobia = forgedCharacter.phobia ? forgedCharacter.phobia : null
    character.type = 'character'
    character.status = 'normal'

    const pronouns = await PronounsModel.query().where('type', forgedCharacter.sex).firstOrFail()
    const relationshipGoals = await RelationshipGoal.query().orderByRaw('RAND()').firstOrFail()

    await character.related('pronoun').associate(pronouns)
    await character.related('relationshipGoal').associate(relationshipGoals)

    await new ComfyUiService().sendPrompt(forgedCharacter, character.uid)
    const bio = await textGenApi.generateBio(
      character,
      Env.get('MODEL_INSTRUCTIONS_TYPE'),
      forgedHobbies,
      forgedPersonalityTraits
    )

    if (bio != null || bio != undefined) {
      character.bio = bio.trim().replace(/^"|"$/g, '')
    }
    

    console.log(character.bio)

    const createdCharacter = await character.save()

    const hobbies = await HobbyModel.query().whereIn('name', forgedHobbies)
    const traits = await PersonalityTraitModel.query().whereIn('name', forgedPersonalityTraits)

    await createdCharacter.related('hobbies').attach(hobbies.map((hobby) => hobby.id))
    await createdCharacter.related('personalityTraits').attach(traits.map((trait) => trait.id))

    return createdCharacter
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
        'occupation',
        'last_swipe',
        'available_swipes',
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

        if (filteredPreferences.body_types.length != 0) {
          const body_types = await BodyType.query().whereIn('name', filteredPreferences.body_types)
          preference.related('body_types').attach(body_types.map((bodyType) => bodyType.id))
        }

        if (filteredPreferences.political_views.length != 0) {
          const political_views = await PoliticalView.query().whereIn(
            'name',
            filteredPreferences.political_views
          )
          preference.related('political_views').attach(political_views.map((view) => view.id))
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
          preference.related('relationship_goals').attach(goals.map((goal) => goal.id))
        }

        await preference.related('user').associate(user)
      }

      await user.save()
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

      Drive.delete(user.imageUrl)
      user.delete()

      return ctx.response.status(200).json({ message: 'User deleted.' })
    } catch (error) {
      return ctx.response.status(400).json({ error: 'Error deleting user' })
    }
  }

  public async checkNsfwDetection({ request, response }: HttpContextContract) {
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
