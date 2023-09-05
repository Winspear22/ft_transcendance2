import { EntityRepository, Repository } from "typeorm";
import { FriendMessage } from "./friendmessage.entity";

@EntityRepository(FriendMessage)
export class FriendMessagesRepository extends Repository<FriendMessage> {}