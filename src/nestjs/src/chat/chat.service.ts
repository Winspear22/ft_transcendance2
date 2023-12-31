import { Inject, Injectable } from '@nestjs/common';
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
import { ChatGateway } from './chat.gateway';

@Injectable()
export class ChatService {

    constructor(
        @InjectRepository(MessageEntity)
        private messageRepository: Repository<MessageEntity>,
        private chatAuthService: ChatAuthService,
        private userService: UserService,
        //private chatGateway: ChatGateway,
    ) {}

    async createMessage(data: CreateMessageDto): Promise<MessageEntity> 
    {
        console.log("Data to be inserted:", data);
        const message = await this.messageRepository.create(data);
        await this.messageRepository.save(message);
        return message;
    }

    async getAllMessages(): Promise<MessageEntity[]> 
    {
        return await this.messageRepository.find();
    }

    async getUserFromSocket(@ConnectedSocket() client: Socket): Promise<UserEntity | undefined>
    {
        let accessTokenCookie = client.handshake.query.Cookie;

        //const accessTokenCookie = client.handshake.headers.cookie;
        console.log("User connected : ", colors.WHITE, client.id, " connection status : ", colors.GREEN, client.connected, colors.RESET);
        if (!accessTokenCookie) 
        {
            console.log('Access Token Cookie is missing!!!');
            //this.chatGateway.handleDisconnect(client);

            return undefined;
        }
    
        if (Array.isArray(accessTokenCookie)) {
            accessTokenCookie = accessTokenCookie[0];
        }

        const userData = this.chatAuthService.extractAccessTokenFromCookie(accessTokenCookie);
            if (!userData)
            {   //this.chatGateway.handleDisconnect(client);
                return undefined;
            }
        const { username, refreshToken, accessToken } = userData;
    
        /*if (await this.chatAuthService.isTokenBlacklisted(accessToken)) {
            console.log('Token is blacklisted.');
            return undefined;
        }*/
   
        const decodedPayload = this.chatAuthService.decodeAccessToken(accessToken);
        if (!decodedPayload) {
            //this.chatGateway.handleDisconnect(client);

            console.log('Token is invalid or malformed.');
            return undefined;
        }
    
        if (this.chatAuthService.hasTokenExpired(decodedPayload.exp)) {
            //this.chatGateway.handleDisconnect(client);

            console.log('Token has expired.');
            return undefined;
        }
    
        const payload = await this.chatAuthService.verifyToken(accessToken, process.env.ACCESS_TOKEN);
        if (!payload) {
            //this.chatGateway.handleDisconnect(client);

            return undefined;
        }

   
        const user = await this.userService.findUserByUsername(username);
        client.data.user = user;
    
        if (user)
            return (user);
        else
        {
            //this.chatGateway.handleDisconnect(client);
            return undefined;
        }
    }

}
