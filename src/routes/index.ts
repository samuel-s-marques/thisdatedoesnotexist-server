import { Application } from "express";
import feedbackRoutes from "./feedback.routes.js";
import characterRoutes from "./character.routes.js";

export default class Routes {
  constructor(app: Application) {
    app.use("/api/feedback", feedbackRoutes);
    app.use("/api/character", characterRoutes);
  }
}
