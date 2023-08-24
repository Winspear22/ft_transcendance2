import { RoomEntity2 } from "../entities/room2.entity";
import { IsString, IsBoolean } from 'class-validator';


export class RoomDto extends RoomEntity2 {}


export class RoomFromFrontDto 
{
    @IsString()
    public roomName: string;

    @IsString()
    public password: string;

    @IsBoolean()
    public publicRoom: boolean;
}