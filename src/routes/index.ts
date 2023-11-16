import { Application } from "express";
import feedbackRoutes from "./feedback.routes.js";

export default class Routes {
    constructor(app: Application) {
        app.use('/api/feedback', feedbackRoutes);
    }
}