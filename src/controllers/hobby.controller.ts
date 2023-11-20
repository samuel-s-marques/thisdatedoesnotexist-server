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
}
