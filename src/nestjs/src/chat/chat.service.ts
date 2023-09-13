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
import { RoomService } from './room.service';
import { RoomEntity } from './entities/room.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ChatService {

    constructor(
        @InjectRepository(MessageEntity)
        private messageRepository: Repository<MessageEntity>,
        private chatAuthService: ChatAuthService,
        private userService: UserService,
        private roomService: RoomService,
        @InjectRepository(RoomEntity)
        private roomRepository: Repository<RoomEntity>,
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
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
        let accessTokenCookie = client.handshake.query.cookie;
        console.log("User connected : ", colors.WHITE, client.id, " connection status : ", colors.GREEN, client.connected, colors.RESET);

        if (!accessTokenCookie) 
        {
            console.log('Access Token Cookie is missing!!!');
            return undefined;
        }
    
        if (Array.isArray(accessTokenCookie)) {
            accessTokenCookie = accessTokenCookie[0];
        }

        const userData = this.chatAuthService.extractAccessTokenFromCookie(accessTokenCookie);
            if (!userData)
                return undefined;
        const { username, refreshToken, accessToken } = userData;
    
        /*if (await this.chatAuthService.isTokenBlacklisted(accessToken)) {
            console.log('Token is blacklisted.');
            return undefined;
        }*/
   
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

    /*async setUserAdminStatusON(@ConnectedSocket() client: Socket,
    roomId: number): Promise<void>
    {
        const user = await this.usersRepository.findOne({ where: { id: client.data.user.id }, relations: ['administratedRooms'] })
        const room = await this.roomService.getRoomById(roomId);
        console.log(colors.BRIGHT + colors.BLUE + "SocketID === " + colors.WHITE, client.id + " ", client.data.user.username + colors.RESET);
        console.log("AdminStatus size === ", user.administratedRooms.length);
        if (!user.administratedRooms.includes(room)) {
            user.administratedRooms.push(room);
        }
        console.log("AdminStatus size === ", user.administratedRooms.length);
        console.log("Room administrator === ", user.administratedRooms);

    }

    async setUserAdminStatusOFF(@ConnectedSocket() client: Socket,
    roomId: number): Promise<void>
    {
        const user = await this.usersRepository.findOne({ where: { id: client.data.user.id }, relations: ['administratedRooms'] })
        const room = await this.roomService.getRoomById(roomId);
        console.log(colors.BRIGHT + colors.BLUE + "SocketID === " + colors.WHITE, client.id + " ", client.data.user.username + colors.RESET);
        console.log("AdminStatus size === ", user.administratedRooms.length);
        if (user.administratedRooms.includes(room)) {
            user.administratedRooms = user.administratedRooms.filter(roomItem => roomItem.id !== room.id);
        }
        console.log(colors.GREEN, "AdminStatus size === ", user.administratedRooms.length, colors.RESET);
        console.log("Room administrator === ", user.administratedRooms);
    }

    async setUserCreatorStatusON(@ConnectedSocket() client: Socket,
    roomId: number): Promise<void>
    {
        const user = await this.usersRepository.findOne({ where: { id: client.data.user.id }, relations: ['createdRooms'] })
        const room = await this.roomService.getRoomById(roomId);
        console.log(colors.BRIGHT + colors.BLUE + "SocketID === " + colors.WHITE, client.id + " ", client.data.user.username + colors.RESET);
        console.log("CreatedRooms size === ", user.createdRooms.length);
        if (!user.createdRooms.includes(room)) {
            user.createdRooms.push(room);
        }
        console.log(colors.CYAN, "CreatedRooms size === ", user.createdRooms.length);
        console.log("Room created : ", user.createdRooms);

    }

    async setUserCreatorStatusOFF(@ConnectedSocket() client: Socket,
    roomId: number): Promise<void>
    {
        const user = await this.usersRepository.findOne({ where: { id: client.data.user.id }, relations: ['createdRooms'] })
        const room = await this.roomService.getRoomById(roomId);
        console.log(colors.BRIGHT + colors.BLUE + "SocketID === " + colors.WHITE, client.id + " ", client.data.user.username + colors.RESET);
        console.log("CreatedRooms size === ", + colors.CYAN + user.createdRooms.length);
        if (user.createdRooms.includes(room)) {
            user.createdRooms = user.createdRooms.filter(roomItem => roomItem.id !== room.id);
        }
        console.log(colors.CYAN, "CreatedRooms size === ", user.createdRooms.length);
        console.log("Room created : ", + colors.MAGENTA, user.createdRooms);
    }*/

    /*===============================ROOM DATA===============================*/

    /*=======================================================================*/
}
