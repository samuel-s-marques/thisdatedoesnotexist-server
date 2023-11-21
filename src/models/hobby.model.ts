import { RowDataPacket } from "mysql2";

export interface IHobby extends RowDataPacket {
    id?: number;
    name: string;
    type: string;
}