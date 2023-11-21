import connection from "../config/db.config.js";
import { ResultSetHeader } from "mysql2";
import { ICharacter } from "../models/character.model";

interface ICharacterRepository {
  getCharacters(searchParams: {
    minWeight?: number;
    maxWeight?: number;
    minHeight?: number;
    maxHeight?: number;
    minAge?: number;
    maxAge?: number;
    sex?: string;
    sexuality?: string;
  }): Promise<ICharacter[]>;
  getCharacter(uuid: string): Promise<ICharacter>;
  createCharacter(character: ICharacter): Promise<ICharacter>;
}

class CharacterRepository implements ICharacterRepository {
  async getCharacters(searchParams: {
    minWeight?: number | undefined;
    maxWeight?: number | undefined;
    minHeight?: number | undefined;
    maxHeight?: number | undefined;
    minAge?: number | undefined;
    maxAge?: number | undefined;
    sex?: string | undefined;
    sexuality?: string | undefined;
  }): Promise<ICharacter[]> {
    let query: string =
      "SELECT c.*, GROUP_CONCAT(DISTINCT pt.trait) AS personality_traits, GROUP_CONCAT(DISTINCT h.name) AS hobbies FROM characters c LEFT JOIN character_personality_trait cpt ON c.id = cpt.character_id LEFT JOIN personality_traits pt ON cpt.trait_id = pt.id LEFT JOIN character_hobby ch ON c.id = ch.character_id LEFT JOIN hobbies h ON ch.hobby_id = h.id";
    let condition: string[] = [];

    if (searchParams?.minWeight && searchParams?.maxWeight) {
      condition.push(
        `c.weight BETWEEN ${searchParams.minWeight} AND ${searchParams.maxWeight}`
      );
    }

    if (searchParams?.minHeight && searchParams?.maxHeight) {
      condition.push(
        `c.height BETWEEN ${searchParams.minHeight} AND ${searchParams.maxHeight}`
      );
    }

    if (searchParams?.minAge && searchParams?.maxAge) {
      condition.push(
        `c.age BETWEEN ${searchParams.minAge} AND ${searchParams.maxAge}`
      );
    }

    if (searchParams?.sex) {
      condition.push(`c.sex = "${searchParams.sex}"`);
    }

    if (searchParams?.sexuality) {
      condition.push(`c.sexuality = "${searchParams.sexuality}"`);
    }

    for (let i = 0; i < condition.length; i++) {
      if (i === 0) {
        query += ` WHERE ${condition[i]}`;
      } else {
        query += ` AND ${condition[i]}`;
      }
    }

    query += " GROUP BY c.id";

    return new Promise((resolve, reject) => {
      connection.query<ICharacter[]>(query, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  async getCharacter(uuid: string): Promise<ICharacter> {
    let query: string =
      "SELECT * FROM characters WHERE uuid = ?; SELECT * FROM character_hobby WHERE character_uuid = ?; SELECT * FROM character_personality_trait WHERE character_uuid = ?";

    return new Promise((resolve, reject) => {
      connection.query<ICharacter[]>(query, [uuid, uuid, uuid], (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            ...res[0][0],
            hobbies: res[1],
            personalityTraits: res[2],
          });
        }
      });
    });
  }

  async createCharacter(character: ICharacter): Promise<ICharacter> {
    return new Promise((resolve, reject) => {
      connection.query<ResultSetHeader>(
        "INSERT INTO characters (uuid, name, nickname, surname, sex, age, weight, height, hair_color, eye_color, hair_style, ethnicity, birthplace, occupation, social_class, political_view, sexuality, alignment, phobia) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          character.uuid,
          character.name,
          character.nickname,
          character.surname,
          character.sex,
          character.age,
          character.bodyType.weight,
          character.bodyType.height,
          character.hairColor,
          character.eyeColor,
          character.hairStyle,
          character.ethnicity,
          character.birthplace,
          character.occupation,
          character.socialClass,
          character.politicalView,
          character.sexuality.sexuality,
          character.alignment,
          character.phobia,
        ],
        (err, res) => {
          if (err) {
            reject(err);
          } else {
            this.getCharacter(character.uuid)
              .then((character) => resolve(character))
              .catch(reject);
          }
        }
      );
    });
  }
}

export default new CharacterRepository();
