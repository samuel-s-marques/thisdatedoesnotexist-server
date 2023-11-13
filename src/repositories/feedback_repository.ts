import { IFeedback } from "../models/feedback_model.js";

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
    throw new Error("Method not implemented.");
  }

  async updateFeedback(id: number, feedback: IFeedback): Promise<IFeedback> {
    throw new Error("Method not implemented.");
  }

  async deleteFeedback(id: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export default new FeedbackRepository();
