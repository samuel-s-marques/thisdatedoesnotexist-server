import { IHobby } from "../models/hobby.model";

interface IHobbyRepository {
  getHobbies(searchParams: { hobby?: string }): Promise<IHobby[]>;
  getHobbiesByNameArray(hobbiesArray: string[]): Promise<IHobby[]>;
  getHobby(id: number): Promise<IHobby>;
}

class HobbiesRepository implements IHobbyRepository {
  getHobbies(searchParams: { hobby?: string | undefined }): Promise<IHobby[]> {
    throw new Error("Method not implemented.");
  }

  getHobbiesByNameArray(hobbiesArray: string[]): Promise<IHobby[]> {
    throw new Error("Method not implemented.");
  }

  getHobby(id: number): Promise<IHobby> {
    throw new Error("Method not implemented.");
  }
}
