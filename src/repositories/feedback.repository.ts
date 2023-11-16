import { IFeedback } from "../models/feedback_model.js";
import connection from "../config/db.config.js";
import { ResultSetHeader } from "mysql2";

interface IFeedbackRepository {
  getFeedbacks(searchParams: {
    user_uid?: string;
    text?: string;
    created_at?: string;
  }): Promise<IFeedback[]>;
  getFeedback(id: number): Promise<IFeedback>;
  createFeedback(feedback: IFeedback): Promise<IFeedback>;
  updateFeedback(id: number, feedback: IFeedback): Promise<IFeedback>;
  deleteFeedback(id: number): Promise<void>;
}

class FeedbackRepository implements IFeedbackRepository {
  async getFeedbacks(searchParams: {
    user_uid?: string;
    text?: string;
    created_at?: string;
  }): Promise<IFeedback[]> {
    let query: string = "SELECT * FROM feedback";
    let condition: string[] = [];

    if (searchParams?.user_uid) {
      condition.push(`user_uid = '${searchParams.user_uid}'`);
    }

    if (searchParams?.created_at) {
      condition.push(`created_at = '${searchParams.created_at}'`);
    }

    if (searchParams?.text) {
      condition.push(`LOWER(text) LIKE '%${searchParams.text}%'`);
    }

    for (let i = 0; i < condition.length; i++) {
      if (i === 0) {
        query += ` WHERE ${condition[i]}`;
      } else {
        query += ` AND ${condition[i]}`;
      }
    }

    return new Promise((resolve, reject) => {
      connection.query<IFeedback[]>(query, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  async getFeedback(id: number): Promise<IFeedback> {
    return new Promise((resolve, reject) => {
      connection.query<IFeedback[]>(
        "SELECT * FROM feedback WHERE id = ?",
        [id],
        (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res?.[0]);
          }
        }
      );
    });
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
    throw new Error("Method Update not implemented.");
  }

  async deleteFeedback(id: number): Promise<void> {
    throw new Error("Method Delete not implemented.");
  }
}

export default new FeedbackRepository();
