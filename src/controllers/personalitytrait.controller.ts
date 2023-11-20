import { Request, Response } from "express";
import personalityTraitRepository from "../repositories/personality_trait.repository";

export default class PersonalityTraitController {
  async getAll(req: Request, res: Response) {
    const name =
      typeof req.query.name === "string" ? req.query.name : undefined;

    try {
      const personalityTraits = await personalityTraitRepository.getPersonalityTraits({ name });

      res.status(200).send(personalityTraits);
    } catch (error) {
      res.status(500).send({
        status: "error",
        message: "Some error occurred while retrieving PersonalityTraits.",
      });
    }
  }

  async get(req: Request, res: Response) {
    const id: string = req.params.id;

    try {
      const trait = await personalityTraitRepository.getPersonalityTrait(parseInt(id));

      if (trait) {
        res.status(200).send(trait);
      } else {
        res.status(404).send({
          status: "error",
          message: `PersonalityTrait with id ${id} not found.`,
        });
      }
    } catch (error) {
      res.status(500).send({
        status: "error",
        message: `Some error occurred while retrieving PersonalityTrait with id ${id}.`,
      });
    }
  }
}
