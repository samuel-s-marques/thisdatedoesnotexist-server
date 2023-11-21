import { RowDataPacket } from "mysql2";

export interface ICharacterHobby extends RowDataPacket {
    character_id: number;
    character_uuid: string;
    hobby_id: number;
}