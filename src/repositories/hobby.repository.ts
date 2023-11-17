import { IHobby } from "../models/hobby.model";

interface IHobbyRepository {
  getHobbies(searchParams: { hobby?: string }): Promise<IHobby[]>;
  getHobbiesByNameArray(hobbiesArray: string[]): Promise<IHobby[]>;
  getHobby(id: number): Promise<IHobby>;
}
