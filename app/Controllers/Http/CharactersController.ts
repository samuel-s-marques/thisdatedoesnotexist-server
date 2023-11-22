import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CharacterModel from 'App/Models/CharacterModel'
import HobbyModel from 'App/Models/HobbyModel'
import PersonalityTraitModel from 'App/Models/PersonalityTraitModel'
import PronounsModel from 'App/Models/PronounsModel'
import { CharacterForge } from 'character-forge'
import { v4 as uuidv4 } from 'uuid'

export default class CharactersController {
  public async index(ctx: HttpContextContract) {
    const page = ctx.request.input('page', 1)
    const query = ctx.request.input('query')
    const value = ctx.request.input('value')

    if (query && value) {
      const characters = await CharacterModel.query()
        .preload('hobbies')
        .preload('personalityTraits')
        .preload('pronouns')
        .where(query, value)
        .paginate(page, 40)

      return characters
    }

    const characters = await CharacterModel.query()
      .preload('hobbies')
      .preload('personalityTraits')
      .preload('pronouns')
      .paginate(page, 40)
    return characters
  }

  public async show(ctx: HttpContextContract) {
    const character = await CharacterModel.query()
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
