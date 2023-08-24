import { EntityRepository, Repository } from "typeorm";
import { RoomEntity2 } from "./room2.entity";

@EntityRepository(RoomEntity2)
export class RoomsRepository2 extends Repository<RoomEntity2> {}