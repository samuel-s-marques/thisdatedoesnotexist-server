import { Request, Response } from "express";
import FeedbackRepository from "../repositories/feedback.repository";
import { IFeedback } from "../models/feedback_model";

export default class FeedbackController {
  async create(req: Request, res: Response) {
    if (
      !req.body.user_uid ||
      !req.body.text ||
      !req.file ||
      !req.file.originalname.endsWith(".png")
    ) {
      res.status(400).send({
        status: "error",
        message:
          "Content can not be empty. Please fill all required fields (user_uid, text, screenshot)!",
      });

      return;
    }

    const image = req.file.filename.split(".")[0];

    try {
      let feedback: IFeedback = {
        user_uid: req.body.user_uid,
        text: req.body.text,
        screenshot: image,
        created_at: undefined,
        constructor: { name: "RowDataPacket" },
      };
      const createdFeedback = await FeedbackRepository.createFeedback(feedback);

      res.status(201).send(createdFeedback);
    } catch (error) {
      console.error(error);

      res.status(500).send({
        status: "error",
        message: "Some error occurred while creating feedback",
      });
    }
  }

  async update(req: Request, res: Response) {}

  async delete(req: Request, res: Response) {}

  async get(req: Request, res: Response) {}

  async getAll(req: Request, res: Response) {}
}
