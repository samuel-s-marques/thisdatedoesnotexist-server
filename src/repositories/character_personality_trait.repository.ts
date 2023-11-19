import { ICharacterPersonalityTrait } from "../models/character_personality_trait.model";
import connection from "../config/db.config.js";

interface ICharacterPersonalityTraitRepository {
  getCharacterPersonalityTraits(searchParams: {
    character_id?: number;
    trait_id?: number;
  }): Promise<ICharacterPersonalityTrait[]>;
  createCharacterPersonalityTrait(
    characterPersonalityTrait: ICharacterPersonalityTrait
  ): Promise<ICharacterPersonalityTrait>;
}

class CharacterPersonalityTraitRepository
  implements ICharacterPersonalityTraitRepository
{
  async getCharacterPersonalityTraits(searchParams: {
    character_id?: number;
    trait_id?: number;
  }): Promise<ICharacterPersonalityTrait[]> {
    let query: string = "SELECT * FROM character_personality_trait";
    let condition: string[] = [];

    if (searchParams?.character_id) {
      condition.push(`character_id = '${searchParams.character_id}'`);
    }

    if (searchParams?.trait_id) {
      condition.push(`trait_id = '${searchParams.trait_id}'`);
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

  async createCharacterPersonalityTrait(
    characterPersonalityTrait: ICharacterPersonalityTrait
  ): Promise<ICharacterPersonalityTrait> {
    return new Promise((resolve, reject) => {
      connection.query<ICharacterPersonalityTrait[]>(
        "INSERT INTO character_personality_trait (character_id, trait_id) VALUES (?, ?)",
        [
          characterPersonalityTrait.character_id,
          characterPersonalityTrait.trait_id,
        ],
        (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res?.[0]);
          }
        }
      );
    });
  }
}

export default new CharacterPersonalityTraitRepository();