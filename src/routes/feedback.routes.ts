import { Router } from "express";
import FeedbackController from "../controllers/feedback.controller.js";

class FeedbackRoutes {
    router = Router();
    controller = new FeedbackController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post("/", this.controller.create);
        this.router.get("/", this.controller.getAll);
        this.router.get("/:id", this.controller.get);
        this.router.put("/:id", this.controller.update);
        this.router.delete("/:id", this.controller.delete);
    }
}

export default new FeedbackRoutes().router;