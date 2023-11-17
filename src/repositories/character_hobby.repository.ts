import { ICharacterHobby } from "../models/character_hobby.model";
import connection from "../config/db.config.js";

interface ICharacterHobbyRepository {
  getCharacterHobbies(searchParams: {
    character_id?: number;
    hobby_id?: number;
  }): Promise<ICharacterHobby[]>;
  createCharacterHobby(
    characterHobby: ICharacterHobby
  ): Promise<ICharacterHobby>;
}

class CharacterHobbyRepository implements ICharacterHobbyRepository {
  getCharacterHobbies(searchParams: {
    character_id?: number | undefined;
    hobby_id?: number | undefined;
  }): Promise<ICharacterHobby[]> {
    let query: string = "SELECT * FROM character_personality_traits";
    let condition: string[] = [];

    if (searchParams?.character_id) {
      condition.push(`character_id = '${searchParams.character_id}'`);
    }

    if (searchParams?.hobby_id) {
      condition.push(`hobby_id = '${searchParams.hobby_id}'`);
    }

    for (let i = 0; i < condition.length; i++) {
      if (i === 0) {
        query += ` WHERE ${condition[i]}`;
      } else {
        query += ` AND ${condition[i]}`;
      }
    }

    return new Promise((resolve, reject) => {
      connection.query<ICharacterHobby[]>(query, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  createCharacterHobby(
    characterHobby: ICharacterHobby
  ): Promise<ICharacterHobby> {
    throw new Error("Method not implemented.");
  }
}

export default new CharacterHobbyRepository();
