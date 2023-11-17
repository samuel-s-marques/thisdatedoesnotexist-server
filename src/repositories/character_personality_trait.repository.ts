import { ICharacterPersonalityTrait } from "../models/character_personality_trait.model";
import connection from "../config/db.config.js";

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
    let query: string = "SELECT * FROM character_personality_traits";
    let condition: string[] = [];

    if (searchParams?.character_id) {
      condition.push(`character_id = '${searchParams.character_id}'`);
    }

    if (searchParams?.personality_trait_id) {
      condition.push(
        `personality_trait_id = '${searchParams.personality_trait_id}'`
      );
    }

    for (let i = 0; i < condition.length; i++) {
      if (i === 0) {
        query += ` WHERE ${condition[i]}`;
      } else {
        query += ` AND ${condition[i]}`;
      }
    }

    return new Promise((resolve, reject) => {
      connection.query<ICharacterPersonalityTrait[]>(query, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  async createCharacterPersonalityTrait(): Promise<ICharacterPersonalityTrait> {
    throw new Error("Method not implemented.");
  }
}
