import { RowDataPacket } from "mysql2";

export interface ICharacterPersonalityTrait extends RowDataPacket {
    character_id: number;
    trait_id: number;
}