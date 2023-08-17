import { EntityRepository, Repository } from "typeorm";
import { MessageEntity } from "./message.entity";

@EntityRepository(MessageEntity)
export class MessagesRepository extends Repository<MessageEntity> {}