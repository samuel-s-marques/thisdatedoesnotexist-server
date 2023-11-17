import { Router } from "express";
import CharacterController from "../controllers/character.controller";

class CharacterRoutes {
  router = Router();
  controller = new CharacterController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get("/", this.controller.getAll);
    this.router.get("/:id", this.controller.get);
    this.router.delete("/:id", this.controller.delete);
  }
}

export default new CharacterRoutes().router;
