import Application from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BodyType from 'App/Models/BodyType'
import HobbyModel from 'App/Models/HobbyModel'
import PoliticalView from 'App/Models/PoliticalView'
import Preference from 'App/Models/Preference'
import RelationshipGoal from 'App/Models/RelationshipGoal'
import Sex from 'App/Models/Sex'
import User from 'App/Models/User'
import { v4 as uuidv4 } from 'uuid'
import Drive from '@ioc:Adonis/Core/Drive'
import { AgesModule, CharacterForge } from 'character-forge'
import PersonalityTraitModel from 'App/Models/PersonalityTraitModel'
import PronounsModel from 'App/Models/PronounsModel'
import ComfyUiService from 'Service/ComfyUiService'
import NSFWDetectionService from 'Service/NSFWDetectionService'
import fs from 'fs'
import ProfileSuggesterService from 'Service/ProfileSuggesterService'
import Message from 'App/Models/Message'
import BannedUser from 'App/Models/BannedUser'
import TextGenerationService from 'Service/TextGenerationService'
import { replaceMacros } from 'Util/util'
import Occupation from 'App/Models/Occupation'
import Religion from 'App/Models/Religion'

const textGenApi = new TextGenerationService()
const profileSuggesterService = new ProfileSuggesterService()

export default class UsersController {
  public async index({ request, response }: HttpContextContract) {
    const page = request.input('page', 1)
    const searchQuery = request.qs()

    const user = await User.query()
      .where('uid', request.token.uid)
      .preload('hobbies')
      .preload('relationshipGoal')
      .preload('politicalView')
      .preload('religion')
      .firstOrFail()

    const characters = await User.query()
      .preload('hobbies')
      .preload('pronoun')
      .preload('relationshipGoal')
      .preload('occupation')
      .preload('politicalView')
      .preload('religion')
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
        query.whereHas('relationshipGoal', (relation) => {
          relation.whereIn('name', searchQuery.relationship_goal.split(','))
        })
      })
      .if(searchQuery.min_age && searchQuery.max_age, (query) => {
        query.whereBetween('age', [searchQuery.min_age, searchQuery.max_age])
      })
      .paginate(page, 25)

    const charactersJson = characters.toJSON()
    const profileSuggester = await profileSuggesterService.getProfilesFromApi(
      user,
      charactersJson.data
    )

    if (profileSuggester.status != 200) {
      return response.status(502).json({
        error: {
          code: 502,
          message: 'Bad Gateway',
          details: 'Error getting profiles from API.',
        },
      })
    }

    const profiles = profileSuggester.data.suggested_profiles

    return {
      meta: {
        total: characters.total,
        per_page: characters.perPage,
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

  public async show({ request, response }: HttpContextContract) {
    try {
      const uid = request.token.uid

      const user = await User.query()
        .where('uid', uid)
        .preload('hobbies')
        .preload('pronoun')
        .preload('relationshipGoal')
        .preload('occupation')
        .preload('politicalView')
        .preload('religion')
        .preload('preferences', (query) => {
          query
            .preload('body_types')
            .preload('political_views')
            .preload('relationship_goals')
            .preload('sexes')
        })
        .firstOrFail()

      return user
    } catch (error) {
      return response.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: `Error getting user: ${error.message}`,
        },
      })
    }
  }

  public async showCharacter({ response, params }: HttpContextContract) {
    try {
      const character = await User.query()
        .where('uid', params.uuid)
        .preload('hobbies')
        .preload('pronoun')
        .preload('relationshipGoal')
        .preload('personalityTraits')
        .preload('occupation')
        .preload('politicalView')
        .preload('religion')
        .firstOrFail()

      return character
    } catch (error) {
      return response.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: 'Error getting character.',
        },
      })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    try {
      const uid = request.token.uid
      const email = request.token.email
      const existingUser = await User.findBy('uid', uid)

      if (existingUser) {
        return response.status(400).json({ error: 'User already exists' })
      }

      const newUser = new User()
      const data = request.only([
        'name',
        'email',
        'birthday',
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
        return response.status(400).json({
          error: {
            code: 400,
            message: 'Bad Request',
            details: 'Profile image is required',
          },
        })
      }

      if (!profileImage.isValid) {
        return response.status(400).json({
          error: {
            code: 400,
            message: 'Bad Request',
            details: profileImage.errors,
          },
        })
      }

      const imageName = uuidv4() + '.' + profileImage.extname
      await profileImage.move(Application.publicPath('uploads'), {
        name: imageName,
        overwrite: true,
      })

      let filteredData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v != null))

      if (!filteredData.email) {
        filteredData.email = email
      }

      if (await BannedUser.findBy('email', filteredData.email)) {
        return response.status(400).json({ error: 'You have been banned.' })
      }

      filteredData.active = true

      const pronoun = await PronounsModel.findOrFail(filteredData.pronoun.id)
      const relationshipGoal = await RelationshipGoal.findOrFail(filteredData.relationship_goal.id)
      const occupation = await Occupation.findOrFail(filteredData.occupation.id)
      const politicalView = await PoliticalView.findOrFail(filteredData.political_view.id)
      const religion = await Religion.findOrFail(filteredData.religion.id)

      if (filteredData.hasOwnProperty('relationship_goal')) {
        delete filteredData['relationship_goal']
      }

      if (filteredData.hasOwnProperty('pronoun')) {
        delete filteredData['pronoun']
      }

      if (filteredData.hasOwnProperty('occupation')) {
        delete filteredData['occupation']
      }

      newUser.fill({
        uid: uid,
        imageUrl: `/uploads/${imageName}`,
        type: 'user',
        status: 'normal',
        ...filteredData,
      })

      await newUser.related('pronoun').associate(pronoun)
      await newUser.related('relationshipGoal').associate(relationshipGoal)
      await newUser.related('occupation').associate(occupation)
      await newUser.related('politicalView').associate(politicalView)
      await newUser.related('religion').associate(religion)

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

      return response.status(201).send(user)
    } catch (error) {
      return response.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: `Error creating user: ${error.message}`,
        },
      })
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
    character.country = forgedCharacter.birthplace
    character.ethnicity = forgedCharacter.ethnicity
    character.eyeColor = forgedCharacter.eyeColor
    character.hairColor = forgedCharacter.hairColor
    character.socialClass = forgedCharacter.socialClass
    character.phobia = forgedCharacter.phobia ? forgedCharacter.phobia : null
    character.type = 'character'
    character.status = 'normal'

    const pronouns = await PronounsModel.query().where('type', forgedCharacter.sex).firstOrFail()
    const relationshipGoals = await RelationshipGoal.query().orderByRaw('RAND()').firstOrFail()
    const occupation = await Occupation.query()
      .where('name', forgedCharacter.occupation)
      .firstOrFail()
    const politicalView = await PoliticalView.query()
      .where('name', forgedCharacter.politicalView)
      .firstOrFail()
    const religion = await Religion.query().where('name', forgedCharacter.religion).firstOrFail()

    await character.related('pronoun').associate(pronouns)
    await character.related('relationshipGoal').associate(relationshipGoals)
    await character.related('occupation').associate(occupation)
    await character.related('politicalView').associate(politicalView)
    await character.related('religion').associate(religion)

    await new ComfyUiService().sendPrompt(forgedCharacter, character.uid)
    const characterJson = character.toJSON()
    characterJson.pronoun = pronouns.toObject()
    characterJson.relationshipGoal = relationshipGoals.toJSON()
    characterJson.hobbies = forgedHobbies.map((hobby) => ({ name: hobby }))
    characterJson.personalityTraits = forgedPersonalityTraits.map((trait) => ({ name: trait }))

    const bio = await this.generateBio(characterJson)

    if (bio != null || bio != undefined) {
      character.bio = bio.trim().replace(/^"|"$/g, '')
    }

    const createdCharacter = await character.save()

    const hobbies = await HobbyModel.query().whereIn('name', forgedHobbies)
    const traits = await PersonalityTraitModel.query().whereIn('name', forgedPersonalityTraits)

    await createdCharacter.related('hobbies').attach(hobbies.map((hobby) => hobby.id))
    await createdCharacter.related('personalityTraits').attach(traits.map((trait) => trait.id))

    return createdCharacter
  }

  public async update({ request, response }: HttpContextContract) {
    try {
      const uid = request.token.uid
      const user = await User.findBy('uid', uid)

      if (!user) {
        return response.status(404).json({
          error: {
            code: 404,
            message: 'Not Found',
            details: 'User does not exist.',
          },
        })
      }

      const data = request.only([
        'name',
        'email',
        'birthday',
        'sex',
        'bio',
        'weight',
        'height',
        'surname',
        'occupation',
        'hobbies',
        'religion',
        'country',
        'political_view',
        'relationship_goal',
        'pronoun',
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
      return response.status(201).send(user)
    } catch (error) {
      return response.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: `Error updating user: ${error.message}`,
        },
      })
    }
  }

  public async destroy({ request, response }: HttpContextContract) {
    try {
      const uid = request.token.uid
      const user = await User.findByOrFail('uid', uid)

      Drive.delete(user.imageUrl)
      user.delete()

      return response.status(200).json({ message: 'User deleted.' })
    } catch (error) {
      return response.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: `Error deleting user: ${error.message}`,
        },
      })
    }
  }

  public async checkNsfwDetection({ request, response }: HttpContextContract) {
    const nsfwService = await NSFWDetectionService.getInstance()

    const profileImage = request.file('profile_image', {
      size: '2mb',
      extnames: ['jpg', 'png', 'jpeg'],
    })

    if (!profileImage) {
      if (!profileImage) {
        return response.status(400).json({
          error: {
            code: 400,
            message: 'Bad Request',
            details: 'Profile image is required',
          },
        })
      }
    }

    if (!profileImage.isValid) {
      return response.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: profileImage.errors,
        },
      })
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
      return response.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: 'Profile image is NSFW.',
        },
      })
    }

    return response.status(200).json({ message: 'Profile image is safe.' })
  }

  public async status({ request, response }: HttpContextContract) {
    try {
      const uid = request.token.uid
      const user = await User.findByOrFail('uid', uid)
      const messages = await Message.query().where('user_id', user.id).where('reported', true)

      return {
        status: user.status,
        status_reason: user.statusReason,
        status_until: user.statusUntil,
        messages: messages,
      }
    } catch (error) {
      return response.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: `Error getting user status: ${error.message}`,
        },
      })
    }
  }

  public async getAvailableSwipes({ request, response }: HttpContextContract) {
    try {
      const uid = request.token.uid
      const user = await User.findByOrFail('uid', uid)

      return {
        available_swipes: user.availableSwipes,
      }
    } catch (error) {
      return response.status(400).json({
        error: {
          code: 400,
          message: 'Bad Request',
          details: `Error getting available swipes: ${error.message}`,
        },
      })
    }
  }

  private async generateBio(character: object) {
    const prompt = `{{input_sequence}}You are {{char}}, a {{occupation}}. Your hobbies are {{hobbies}}. You are from {{country}}. You can use internet language and be informal. You must write a Tinder bio with no more than two lines. You can write it freely and explicitly.{{output_sequence}}`

    return await textGenApi.sendPrompt(replaceMacros(prompt, character))
  }
}
