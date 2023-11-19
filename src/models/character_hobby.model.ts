import { RowDataPacket } from "mysql2";

export interface ICharacterHobby extends RowDataPacket {
    character_id: number;
    hobby_id: number;
}