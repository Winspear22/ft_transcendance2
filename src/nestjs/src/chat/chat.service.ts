import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from './entities/message.entity';
import { CreateMessageDto } from './dto/message.dto';

@Injectable()
export class ChatService {

    constructor(
        @InjectRepository(MessageEntity)
        private messageRepository: Repository<MessageEntity>,
    ) {}
        /*TABLEAU DE TESTS*/
    messages: MessageEntity[] = [
        {id: 1, sender: 'Adnen', content: 'Hello World', sentDate: new Date()},
        {id: 2, sender: 'Alice', content: 'Hi there!', sentDate: new Date()},
        {id: 3, sender: 'Bob', content: 'How are things?', sentDate: new Date()},
        {id: 4, sender: 'Charlie', content: 'Good morning!', sentDate: new Date()},
        {id: 5, sender: 'David', content: 'Happy to be here.', sentDate: new Date()},
        {id: 6, sender: 'Eve', content: 'What a great day!', sentDate: new Date()},
        {id: 7, sender: 'Frank', content: 'Let\'s chat!', sentDate: new Date()},
        {id: 8, sender: 'Grace', content: 'Hey everyone!', sentDate: new Date()},
        {id: 9, sender: 'Hannah', content: 'I missed the previous messages.', sentDate: new Date()},
        {id: 10, sender: 'Ian', content: 'Can someone update me?', sentDate: new Date()},
    ]

    async getAllMessages(): Promise<MessageEntity[]> 
    {
        this.messageRepository.create(this.messages);
        await this.messageRepository.save(this.messages);
        return await this.messageRepository.find();
    }

    async createMessage(data: CreateMessageDto): Promise<MessageEntity> {
        const message = this.messageRepository.create(data);
        await this.messageRepository.save(message);
        return message;
    }
}
