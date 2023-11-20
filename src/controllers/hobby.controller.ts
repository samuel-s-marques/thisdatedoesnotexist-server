import { Request, Response } from "express";
import hobbyRepository from "../repositories/hobby.repository";

export default class HobbyController {
  async getAll(req: Request, res: Response) {
    const hobby =
      typeof req.query.hobby === "string" ? req.query.hobby : undefined;

    try {
      const hobbies = await hobbyRepository.getHobbies({ hobby });

      res.status(200).send(hobbies);
    } catch (error) {
      res.status(500).send({
        status: "error",
        message: "Some error occurred while retrieving hobbies.",
      });
    }
  }

  async get(req: Request, res: Response) {
    const id: string = req.params.id;

    try {
      const hobby = await hobbyRepository.getHobby(parseInt(id));

      if (hobby) {
        res.status(200).send(hobby);
      } else {
        res.status(404).send({
          status: "error",
          message: `Hobby with id ${id} not found.`,
        });
      }
    } catch (error) {
      res.status(500).send({
        status: "error",
        message: `Some error occurred while retrieving hobby with id ${id}.`,
      });
    }
  }
}
