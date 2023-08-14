import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from './entities/message.entity';
import { CreateMessageDto } from './dto/message.dto';
import { ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UserEntity } from 'src/user/user.entity';
import * as colors from '../colors'
import { ChatAuthService } from './chat-auth.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ChatService {

    constructor(
        @InjectRepository(MessageEntity)
        private messageRepository: Repository<MessageEntity>,
        private chatAuthService: ChatAuthService,
        private userService: UserService
    ) {}
        /*TABLEAU DE TESTS*/
    /*messages: MessageEntity[] = [
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
    ]*/

    async createMessage(data: CreateMessageDto): Promise<MessageEntity> 
    {
        console.log("Data to be inserted:", data);
        const message = await this.messageRepository.create(data);
        await this.messageRepository.save(message);
        return message;
    }

    async getAllMessages(): Promise<MessageEntity[]> 
    {
        //this.messageRepository.create(this.messages);
        //await this.messageRepository.save(this.messages);
        return await this.messageRepository.find();
    }

    async getUserFromSocket(@ConnectedSocket() client: Socket): Promise<UserEntity | undefined>
    {
        const accessTokenCookie = client.handshake.headers.cookie;
        console.log("User connected : ", colors.WHITE, client.id, " connection status : ", colors.GREEN, client.connected, colors.RESET);

        if (!accessTokenCookie) 
        {
            console.log('Access Token Cookie is missing.');
            return undefined;
        }
   
        const userData = this.chatAuthService.extractAccessTokenFromCookie(accessTokenCookie);
        if (!userData)
            return undefined;
        const { username, refreshToken, accessToken } = userData;
    
        if (await this.chatAuthService.isTokenBlacklisted(accessToken)) {
            console.log('Token is blacklisted.');
            return undefined;
        }
   
        const decodedPayload = this.chatAuthService.decodeAccessToken(accessToken);
        if (!decodedPayload) {
            console.log('Token is invalid or malformed.');
            return undefined;
        }
    
        if (this.chatAuthService.hasTokenExpired(decodedPayload.exp)) {
            console.log('Token has expired.');
            return undefined;
        }
    
        const payload = await this.chatAuthService.verifyToken(accessToken, process.env.ACCESS_TOKEN);
        if (!payload) {
            return undefined;
        }

   
        const user = await this.userService.findUserByUsername(username);
        client.data.user = user;
    
        if (user)
            return (user);
        else
            return undefined;
    }
}
