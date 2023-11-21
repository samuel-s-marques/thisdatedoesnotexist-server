import { IHobby } from "../models/hobby.model";
import connection from "../config/db.config.js";

interface IHobbyRepository {
  getHobbies(searchParams: { name?: string }): Promise<IHobby[]>;
  getHobbiesByNameArray(hobbiesArray: string[]): Promise<IHobby[]>;
  getHobby(id: number): Promise<IHobby>;
}

class HobbiesRepository implements IHobbyRepository {
  async getHobbies(searchParams: {
    name?: string | undefined;
  }): Promise<IHobby[]> {
    let query: string = "SELECT * FROM hobbies";

    if (searchParams?.name) {
      query = query + ` WHERE LOWER(name) LIKE '%${searchParams.name}%'`;
    }

    return new Promise((resolve, reject) => {
      connection.query<IHobby[]>(query, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  getHobbiesByNameArray(hobbiesArray: string[]): Promise<IHobby[]> {
    return new Promise((resolve, reject) => {
      connection.query<IHobby[]>(
        "SELECT * FROM hobbies WHERE name in (?)",
        [hobbiesArray],
        (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        }
      );
    });
  }

  getHobby(id: number): Promise<IHobby> {
    return new Promise((resolve, reject) => {
      connection.query<IHobby[]>(
        "SELECT * FROM hobbies WHERE id = ?",
        [id],
        (err, res) => {
          if (err) {
            reject(err);
          } else {
            if (res.length) {
              resolve(res[0]);
            } else {
              reject("Hobby not found");
            }
          }
        }
      );
    });
  }
}

export default new HobbiesRepository();