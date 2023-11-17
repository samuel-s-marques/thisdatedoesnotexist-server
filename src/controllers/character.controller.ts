import { Character, CharacterForge } from "character-forge";
import { CronJob } from "cron";
import { Request, Response } from "express";
import { ICharacter } from "../models/character.model";
import { v4 as uuidv4 } from "uuid";
import characterRepository from "../repositories/character.repository";

export default class CharacterController {
  cronJob: CronJob;

  constructor() {
    this.cronJob = new CronJob("* * * * *", async () => {
      try {
        await this.create();
        console.log("Character created");
      } catch (error) {
        console.error(error);
      }
    });

    if (!this.cronJob.running) {
      this.cronJob.start();
    }
  }

  async create() {
    const forge: CharacterForge = new CharacterForge();
    const forgedCharacter: Character = forge.forge();
    const character: ICharacter = {
      uuid: uuidv4(),
      ...forgedCharacter,
      created_at: undefined,
      constructor: { name: "RowDataPacket" },
    };

    await characterRepository.createCharacter(character);
  }

  async delete(req: Request, res: Response) {}

  async get(req: Request, res: Response) {}

  async getAll(req: Request, res: Response) {}
}
