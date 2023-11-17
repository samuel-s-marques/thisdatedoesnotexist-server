import { ICharacterPersonalityTrait } from "../models/character_personality_trait.model";

interface ICharacterPersonalityTraitRepository {
  getCharacterPersonalityTraits(searchParams: {
    character_id?: string;
    personality_trait_id?: string;
  }): Promise<ICharacterPersonalityTrait[]>;
  createCharacterPersonalityTrait(): Promise<ICharacterPersonalityTrait>;
}

class CharacterPersonalityTraitRepository
  implements ICharacterPersonalityTraitRepository
{
  async getCharacterPersonalityTraits(searchParams: {
    character_id?: string;
    personality_trait_id?: string;
  }): Promise<ICharacterPersonalityTrait[]> {
    throw new Error("Method not implemented.");
  }

  async createCharacterPersonalityTrait(): Promise<ICharacterPersonalityTrait> {
    throw new Error("Method not implemented.");
  }
}
