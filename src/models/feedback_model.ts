import { RowDataPacket } from "mysql2";

export interface IFeedback extends RowDataPacket {
  id?: number;
  user_uid: string;
  text: string;
  screenshot: string;
  created_at: Date;
}
