import { Router } from "express";
import HobbyController from "../controllers/hobby.controller";

class HobbyRoutes {
    router = Router();
    controller = new HobbyController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get("/", this.controller.getAll);
        this.router.get("/:id", this.controller.get);
    }
}

export default new HobbyRoutes().router;