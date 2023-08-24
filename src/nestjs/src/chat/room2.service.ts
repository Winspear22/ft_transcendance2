import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomEntity2 } from './entities/room2.entity';
import { UserEntity } from 'src/user/user.entity';
import { MessageEntity } from './entities/message.entity';
import * as colors from '../colors';
import { RoomDto } from './dto/room2.dto';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';


@Injectable()
export class RoomService2 
{
    constructor(
        @InjectRepository(RoomEntity2)
        private roomsRepository: Repository<RoomEntity2>,
        private chatService: ChatService,
    ) {}

    /*==================================GETTERS==================================*/
    /*---------------------------------FOR ROOMS---------------------------------*/
    async getRoomByName(roomName: string)
    {
        const room = await this.roomsRepository.findOneBy({ name: roomName });
        if (!room)
            return undefined;
        return await this.roomsRepository.findOneBy({ name: roomName });
    }
    /*===========================================================================*/

    /*=================================CREATORS==================================*/
    async createRoom(user: UserEntity, room: RoomDto)
    {
        var { name, publicChannel, password } = room;
        const roomNamePattern = /^[a-zA-Z0-9]{2,12}$/;
        if (!roomNamePattern.test(name)) 
            return null;
        /*channel.adminUsers = [];
        channel.authPrivateChannelUsers = [];
        channel.owner = creator.userId;*/
        if (!password)
		    password = null;
        if (publicChannel === false)
        {
            if (password)
            {
                const roomPaaswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
                if (!roomPaaswordPattern.test(password))
                    return (null);
                room.password = await this.chatService.setPassword(password);
            }
            /*else {
                // Sinon, ajouter tous les utilisateurs à la liste des utilisateurs autorisés pour les channels privés
                for (const user of channel.users) {
                    channel.authPrivateChannelUsers.push(user.userId);
                }
            }*/
        }
        return this.roomsRepository.save(room);
    }
    /*===========================================================================*/
}