import { CronJob } from "cron";
import { Request, Response } from "express";

export default class CharacterController {
  cronJob: CronJob;

  constructor() {
    this.cronJob = new CronJob("* * * * *", () => {
      console.log("cron job");
    });

    if (!this.cronJob.running) {
      this.cronJob.start();
    }
  }

  async delete(req: Request, res: Response) {}

  async get(req: Request, res: Response) {}

  async getAll(req: Request, res: Response) {}
}
