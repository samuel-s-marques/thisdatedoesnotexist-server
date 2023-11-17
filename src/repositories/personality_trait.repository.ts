import { IPersonalityTrait } from "../models/personality_trait.model";
import connection from "../config/db.config.js";
import { ResultSetHeader } from "mysql2";

interface IPersonalityTraitRepository {
  getPersonalityTraits(searchParams: {
    name?: string;
  }): Promise<IPersonalityTrait[]>;
  getPersonalityTrait(id: number): Promise<IPersonalityTrait>;
}

class PersonalityTraitRepository {
  async getPersonalityTraits(searchParams: {
    name?: string;
  }): Promise<IPersonalityTrait[]> {
    let query: string = "SELECT * FROM personality_traits";
    let condition: string[] = [];

    if (searchParams?.name) {
      condition.push(`name = '${searchParams.name}'`);
    }

    for (let i = 0; i < condition.length; i++) {
      if (i === 0) {
        query += ` WHERE ${condition[i]}`;
      } else {
        query += ` AND ${condition[i]}`;
      }
    }

    return new Promise((resolve, reject) => {
      connection.query<IPersonalityTrait[]>(query, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  async getPersonalityTrait(id: number): Promise<IPersonalityTrait> {
    return new Promise((resolve, reject) => {
      connection.query<IPersonalityTrait[]>(
        "SELECT * FROM personality_traits WHERE id = ?",
        [id],
        (err, res) => {
          if (err) {
            reject(err);
          } else {
            if (res.length) {
              resolve(res[0]);
            } else {
              reject("Personality trait not found");
            }
          }
        }
      );
    });
  }
}
