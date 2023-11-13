import express, { Application, Express } from "express";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import Routes from "./routes";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

export default class Server {
  constructor(app: Application) {
    this.config(app);
    new Routes(app);
  }

  private config(app: Application): void {
    const corsOptions: CorsOptions = {
      origin: "http://localhost:7777",
    };

    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
  }
}
