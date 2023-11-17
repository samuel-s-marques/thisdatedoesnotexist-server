import { RowDataPacket } from "mysql2";

export interface IPersonalityTrait extends RowDataPacket {
    id?: number;
    trait: string;
    created_at?: Date;
}