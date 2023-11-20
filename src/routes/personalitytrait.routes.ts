import { Router } from "express";
import PersonalityTraitController from "../controllers/personalitytrait.controller";

class PersonalityTraitRoutes {
    router = Router();
    controller = new PersonalityTraitController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get("/", this.controller.getAll);
        this.router.get("/:id", this.controller.get);
    }
}

export default new PersonalityTraitRoutes().router;