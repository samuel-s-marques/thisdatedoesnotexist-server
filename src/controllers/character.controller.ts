import { Character, CharacterForge } from "character-forge";
import { CronJob } from "cron";
import { Request, Response } from "express";
import { ICharacter } from "../models/character.model";
import { v4 as uuidv4 } from "uuid";
import characterRepository from "../repositories/character.repository";
import personalityTraitRepository from "../repositories/personality_trait.repository";
import hobbyRepository from "../repositories/hobby.repository";
import characterPersonalityTraitRepository from "../repositories/character_personality_trait.repository";
import characterHobbyRepository from "../repositories/character_hobby.repository";

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
    const forgedPersonalityTraits: string[] =
      forgedCharacter.personalityTraits.map((trait) => trait.name);
    const forgedHobbies: string[] = forgedCharacter.hobbies;
    const character: ICharacter = {
      uuid: uuidv4(),
      ...forgedCharacter,
      created_at: undefined,
      constructor: { name: "RowDataPacket" },
    };

    const savedCharacter: ICharacter =
      await characterRepository.createCharacter(character);

    const personalityTraits =
      await personalityTraitRepository.getPersonalityTraitsByNameArray(
        forgedPersonalityTraits
      );
    const hobbies = await hobbyRepository.getHobbiesByNameArray(forgedHobbies);

    for (let i = 0; i < personalityTraits.length; i++) {
      const trait = personalityTraits[i];

      characterPersonalityTraitRepository.createCharacterPersonalityTrait({
        character_id: savedCharacter.id!,
        trait_id: trait.id!,
        constructor: { name: "RowDataPacket" },
      });
    }

    for (let i = 0; i < hobbies.length; i++) {
      const hobby = hobbies[i];

      characterHobbyRepository.createCharacterHobby({
        character_id: savedCharacter.id!,
        hobby_id: hobby.id!,
        constructor: { name: "RowDataPacket" },
      });
    }
  }

  async delete(req: Request, res: Response) {}

  async get(req: Request, res: Response) {
    const uuid: string = req.params.uuid;

    try {
      const character = await characterRepository.getCharacter(uuid);

      if (character) {
        res.status(200).send(character);
      } else {
        res.status(404).send({
          status: "error",
          message: `Character with uuid ${uuid} not found.`,
        });
      }
    } catch (error) {
      res.status(500).send({
        status: "error",
        message: `Some error occurred while retrieving character with uuid ${uuid}.`,
      });
    }
  }

  async getAll(req: Request, res: Response) {
    const minWeight =
      typeof req.query.minWeight === "string"
        ? parseFloat(req.query.minWeight)
        : undefined;
    const maxWeight =
      typeof req.query.maxWeight === "string"
        ? parseFloat(req.query.maxWeight)
        : undefined;
    const minHeight =
      typeof req.query.minHeight === "string"
        ? parseFloat(req.query.minHeight)
        : undefined;
    const maxHeight =
      typeof req.query.maxHeight === "string"
        ? parseFloat(req.query.maxHeight)
        : undefined;

    try {
      const characters = await characterRepository.getCharacters({
        minWeight,
        maxWeight,
        minHeight,
        maxHeight,
      });

      res.status(200).send(characters);
    } catch (error) {
      res.status(500).send({
        status: "error",
        message: "Some error occurred while retrieving characters.",
      });
    }
  }
}
