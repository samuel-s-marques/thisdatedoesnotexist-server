import { Router } from "express";

class CharacterRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {}
}

export default new CharacterRoutes().router;
