import { IFeedback } from "../models/feedback_model.js";
import connection from "../config/db.config.js";
import { ResultSetHeader } from "mysql2";

interface IFeedbackRepository {
  getFeedbacks(): Promise<IFeedback[]>;
  getFeedback(id: number): Promise<IFeedback>;
  createFeedback(feedback: IFeedback): Promise<IFeedback>;
  updateFeedback(id: number, feedback: IFeedback): Promise<IFeedback>;
  deleteFeedback(id: number): Promise<void>;
}

class FeedbackRepository implements IFeedbackRepository {
  async getFeedbacks(): Promise<IFeedback[]> {
    throw new Error("Method not implemented.");
  }

  async getFeedback(id: number): Promise<IFeedback> {
    throw new Error("Method not implemented.");
  }

  async createFeedback(feedback: IFeedback): Promise<IFeedback> {
    return new Promise((resolve, reject) => {
      connection.query<ResultSetHeader>(
        "INSERT INTO feedback(user_uid, text, screenshot) VALUES(?, ?, ?)",
        [feedback.user_uid, feedback.text, feedback.screenshot],
        (err, res) => {
          if (err) {
            reject(err);
          } else {
            this.getFeedback(res.insertId)
              .then((feedback) => resolve(feedback))
              .catch(reject);
          }
        }
      );
    });
  }

  async updateFeedback(id: number, feedback: IFeedback): Promise<IFeedback> {
    throw new Error("Method not implemented.");
  }

  async deleteFeedback(id: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export default new FeedbackRepository();
