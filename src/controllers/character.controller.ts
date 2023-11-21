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
import firestore from "../config/firestore.config";
import { Hobby } from "character-forge/dist/src/modules/hobbies";
const { Timestamp, FieldValue, Filter } = require("firebase-admin/firestore");

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
    const forgedHobbies: Hobby[] = forgedCharacter.hobbies;
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
    const hobbies = await hobbyRepository.getHobbiesByNameArray(
      forgedHobbies.map((hobby) => hobby.name)
    );

    for (let i = 0; i < personalityTraits.length; i++) {
      const trait = personalityTraits[i];

      characterPersonalityTraitRepository.createCharacterPersonalityTrait({
        character_id: savedCharacter.id!,
        trait_id: trait.id!,
        character_uuid: savedCharacter.uuid,
        constructor: { name: "RowDataPacket" },
      });
    }

    for (let i = 0; i < hobbies.length; i++) {
      const hobby = hobbies[i];

      characterHobbyRepository.createCharacterHobby({
        character_id: savedCharacter.id!,
        hobby_id: hobby.id!,
        character_uuid: savedCharacter.uuid,
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
    const minAge =
      typeof req.query.minAge === "string"
        ? parseInt(req.query.minAge)
        : undefined;
    const maxAge =
      typeof req.query.maxAge === "string"
        ? parseInt(req.query.maxAge)
        : undefined;
    const sex = typeof req.query.sex === "string" ? req.query.sex : undefined;
    const sexuality =
      typeof req.query.sexuality === "string" ? req.query.sexuality : undefined;
    const user =
      typeof req.query.user === "string" ? req.query.user : undefined;

    try {
      const characters = await characterRepository.getCharacters({
        minWeight,
        maxWeight,
        minHeight,
        maxHeight,
        minAge,
        maxAge,
        sex,
        sexuality,
      });

      if (user) {
        const userSwipes = await firestore
          .collection("swipes")
          .where("userId", "==", user)
          .get();
        const swipedUserIds = userSwipes.docs.map(
          (doc: any) => doc.data().targetId
        );

        const remainedSwipeCards = characters.filter(
          (character: ICharacter) => !swipedUserIds.includes(character.uuid)
        );

        res.status(200).send({
          data: remainedSwipeCards,
          count: remainedSwipeCards.length,
        });
      } else {
        res.status(200).send({
          data: characters,
          count: characters.length,
        });
      }
    } catch (error) {
      res.status(500).send({
        status: "error",
        message: "Some error occurred while retrieving characters.",
      });
    }
  }
}
