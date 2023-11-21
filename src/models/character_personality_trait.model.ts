import { RowDataPacket } from "mysql2";

export interface ICharacterPersonalityTrait extends RowDataPacket {
    character_id: number;
    character_uuid: string;
    trait_id: number;
}