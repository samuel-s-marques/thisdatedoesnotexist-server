import { Character } from "character-forge";
import connection from "../config/db.config.js";
import { ICharacter } from "../models/character.model.js";

interface ICharacterRepository {
  getCharacters(searchParams: {
    minWeight?: number;
    maxWeight?: number;
    minHeight?: number;
    maxHeight?: number;
  }): Promise<ICharacter[]>;
  getCharacter(id: number, uuid?: string): Promise<ICharacter>;
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
      connection.query<ICharacter[]>(
        query,
        [id || uuid],
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
