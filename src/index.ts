import express, { Application, Express } from "express";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import Routes from "./routes";
import Services from "./services";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

export default class Server {
  constructor(app: Application) {
    this.config(app);
    new Routes(app);
    new Services();
  }

  private config(app: Application): void {
    const corsOptions: CorsOptions = {
      origin: "*:*",
    };

    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
  }
}
