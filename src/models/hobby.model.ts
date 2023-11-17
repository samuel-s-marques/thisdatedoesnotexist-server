import { RowDataPacket } from "mysql2";

export interface IHobby extends RowDataPacket {
    id?: number;
    hobby: string;
    created_at?: Date;
}