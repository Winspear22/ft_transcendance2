import { MessageEntity } from "../entities/message.entity";

//export class CreateMessageDto extends MessageEntity {}
export class CreateMessageDto {
    sender: string;
    content: string;
}