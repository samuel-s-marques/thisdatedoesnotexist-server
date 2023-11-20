import { Application } from "express";
import feedbackRoutes from "./feedback.routes.js";
import characterRoutes from "./character.routes.js";
import hobbyRoutes from "./hobby.routes.js";
import personalitytraitRoutes from "./personalitytrait.routes.js";

export default class Routes {
  constructor(app: Application) {
    app.use("/api/feedback", feedbackRoutes);
    app.use("/api/character", characterRoutes);
    app.use("/api/hobby", hobbyRoutes);
    app.use("/api/trait", personalitytraitRoutes);
  }
}
