import { Router } from "express";
import FeedbackController from "../controllers/feedback.controller.js";
import { v4 as uuidv4 } from "uuid";

class FeedbackRoutes {
  router = Router();
  controller = new FeedbackController();
  multer = require("multer");
  imageStorage = this.multer.diskStorage({
    destination: "output/images/",
    filename: (req: any, file: any, cb: any) => {
      const uuid = uuidv4();
      cb(null, `${uuid}.png`);
    },
  });
  upload = this.multer({
    storage: this.imageStorage,
  });

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      "/",
      this.upload.single("screenshot"),
      this.controller.create
    );
    this.router.get("/", this.controller.getAll);
    this.router.get("/:id", this.controller.get);
    this.router.delete("/:id", this.controller.delete);
  }
}

export default new FeedbackRoutes().router;
