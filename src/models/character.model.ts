import { Character } from "character-forge";
import { RowDataPacket } from "mysql2";

export interface ICharacter extends Character, RowDataPacket {
    id?: number;
    uuid: string;
    created_at?: Date;
}