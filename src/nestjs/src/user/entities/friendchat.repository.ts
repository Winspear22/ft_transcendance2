import { EntityRepository, Repository } from "typeorm";
import { FriendChat } from "./friendchat.entity";

@EntityRepository(FriendChat)
export class FriendChatsRepository extends Repository<FriendChat> {}