import { Character } from "character-forge";
import connection from "../config/db.config.js";
import { ICharacter } from "../models/character.model.js";
import { ResultSetHeader } from "mysql2";

interface ICharacterRepository {
  getCharacters(searchParams: {
    minWeight?: number;
    maxWeight?: number;
    minHeight?: number;
    maxHeight?: number;
  }): Promise<ICharacter[]>;
  getCharacter(id: number, uuid?: string): Promise<ICharacter>;
  createCharacter(character: ICharacter): Promise<ICharacter>;
}

class CharacterRepository implements ICharacterRepository {
  async getCharacters(searchParams: {
    minWeight?: number | undefined;
    maxWeight?: number | undefined;
    minHeight?: number | undefined;
    maxHeight?: number | undefined;
  }): Promise<ICharacter[]> {
    let query: string = "SELECT * FROM characters";
    let condition: string[] = [];

    if (searchParams?.minWeight && searchParams?.maxWeight) {
      condition.push(
        `weight BETWEEN ${searchParams.minWeight} AND ${searchParams.maxWeight}`
      );
    }

    if (searchParams?.minHeight && searchParams?.maxHeight) {
      condition.push(
        `height BETWEEN ${searchParams.minHeight} AND ${searchParams.maxHeight}`
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
      connection.query<ICharacter[]>(query, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  async getCharacter(
    id?: number,
    uuid?: string | undefined
  ): Promise<ICharacter> {
    let query: string = "SELECT * FROM characters WHERE";

    if (id) {
      query += ` id = ?`;
    } else {
      query += ` uuid = ?`;
    }

    return new Promise((resolve, reject) => {
      connection.query<ICharacter[]>(query, [id || uuid], (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res?.[0]);
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
            this.getCharacter(res.insertId)
              .then((character) => resolve(character))
              .catch(reject);
          }
        }
      );
    });
  }
}

export default new CharacterRepository();