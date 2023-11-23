import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CharacterModel from 'App/Models/CharacterModel'
import HobbyModel from 'App/Models/HobbyModel'
import PersonalityTraitModel from 'App/Models/PersonalityTraitModel'
import PronounsModel from 'App/Models/PronounsModel'
import RelationshipGoal from 'App/Models/RelationshipGoal'
import { CharacterForge } from 'character-forge'
import { v4 as uuidv4 } from 'uuid'

export default class CharactersController {
  public async index(ctx: HttpContextContract) {
    const page = ctx.request.input('page', 1)
    const searchQuery = ctx.request.qs()

    const characters = await CharacterModel.query()
      .preload('pronouns')
      .preload('hobbies')
      .preload('personalityTraits')
      .preload('pronouns')
      .if(searchQuery.sex, (query) => {
        query.where('sex', searchQuery.sex)
      })
      .if(searchQuery.sexuality, (query) => {
        query.where('sexuality', searchQuery.sexuality)
      })
      .if(searchQuery.body_type, (query) => {
        query.where('body_type', searchQuery.bodyType)
      })
      .if(searchQuery.political_view, (query) => {
        query.where('political_view', searchQuery.political_view)
      })
      .if(searchQuery.relationship_goal, (query) => {
        query.where('relationship_goal', searchQuery.relationship_goal)
      })
      .if(searchQuery.min_age && searchQuery.max_age, (query) => {
        query.whereBetween('age', [searchQuery.min_age, searchQuery.max_age])
      })
      .paginate(page, 40)
    return characters
  }

  public async show(ctx: HttpContextContract) {
    const character = await CharacterModel.query()
      .preload('pronouns')
      .preload('hobbies')
      .preload('personalityTraits')
      .preload('pronouns')
      .where('uuid', ctx.params.uuid)
      .firstOrFail()

    return character
  }

  public async store() {
    const forge: CharacterForge = new CharacterForge()
    const forgedCharacter = forge.forge()
    const forgedPersonalityTraits = forgedCharacter.personalityTraits.map((trait) => trait.name)
    const forgedHobbies = forgedCharacter.hobbies.map((hobby) => hobby.name)

    let character: CharacterModel = new CharacterModel()
    character.uuid = uuidv4()
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
    character.birthplace = forgedCharacter.birthplace
    character.ethnicity = forgedCharacter.ethnicity
    character.eyeColor = forgedCharacter.eyeColor
    character.hairColor = forgedCharacter.hairColor
    character.religion = forgedCharacter.religion
    character.socialClass = forgedCharacter.socialClass
    character.politicalView = forgedCharacter.politicalView
    character.phobia = forgedCharacter.phobia ? forgedCharacter.phobia : null
    const relationshipGoals = await RelationshipGoal.query().orderByRaw('RAND()').first()
    character.relationshipGoal = relationshipGoals!.name

    const createdCharacter = await character.save()
    const hobbies = await HobbyModel.query().whereIn('name', forgedHobbies)
    const traits = await PersonalityTraitModel.query().whereIn('name', forgedPersonalityTraits)
    const pronouns = await PronounsModel.query().where('type', forgedCharacter.sex)

    await createdCharacter.related('hobbies').attach(hobbies.map((hobby) => hobby.id))
    await createdCharacter.related('personalityTraits').attach(traits.map((trait) => trait.id))
    await createdCharacter.related('pronouns').attach(pronouns.map((pronoun) => pronoun.id))

    return createdCharacter
  }
}
