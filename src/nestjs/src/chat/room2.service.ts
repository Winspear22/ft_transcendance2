import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomEntity2 } from './entities/room2.entity';
import { UserEntity } from 'src/user/user.entity';
import { MessageEntity } from './entities/message.entity';
import * as colors from '../colors';
import { RoomDto, RoomFromFrontDto } from './dto/room2.dto';
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
        console.log(colors.CYAN + "======= ROOM DETAILS =======");
        console.log(colors.GREEN + "ID: " + colors.WHITE + room.id);
        console.log(colors.GREEN + "Name: " + colors.WHITE + room.name);
        console.log(colors.BLUE + "Public Channel: " + colors.WHITE + (room.publicRoom ? "Yes" : "No"));
        console.log(colors.BLUE + "Password: " + colors.WHITE + (room.password ? room.password : "No password set"));
        console.log(colors.BLUE + "Allowed Users In Room: " + colors.WHITE + room.allowedUsersInRoom.join(', '));
        console.log(colors.BLUE + "Direct Message: " + colors.WHITE + (room.directMessage ? "Yes" : "No"));
        console.log(colors.YELLOW + "Room Owner: " + colors.WHITE + room.roomOwner);
        console.log(colors.YELLOW + "Room Administrators: " + colors.WHITE + room.roomAdministrators.join(', '));
        console.log(colors.MAGENTA + "Users in the Room:");
        room.users.forEach(user => {
            console.log(colors.FG_WHITE + "    " + user.username + colors.RESET);  // Assuming UserEntity has a 'name' attribute.
        });
        console.log(colors.CYAN + "=============================");
        return await this.roomsRepository.findOneBy({ name: roomName });
    }

    /*===========================================================================*/

    /*=================================CREATORS==================================*/
    /*async createRoom(user: UserEntity, room: RoomDto)
    {
        var { name, publicChannel, password } = room;
        const roomNamePattern = /^[a-zA-Z0-9]{2,12}$/;
        if (!roomNamePattern.test(name)) 
            return null;
        //room.roomAdministrators = [];
        room.allowedUsersInRoom = [];
        room.roomOwner = user.id.toString();
        room.roomAdministrators.push(user.id.toString());
        //room.allowedUsersInRoom.push(user.id.toString());
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
            else // Si probleme : utiliser boucle for
                room.users.forEach(user => {room.allowedUsersInRoom.push(user.id.toString())});
        }
        return this.roomsRepository.save(room);
    }*/

    async createRoom(user: UserEntity, data: RoomFromFrontDto)
    {        
        const roomNamePattern = /^[a-zA-Z0-9]{2,12}$/;
        if (!roomNamePattern.test(data.roomName)) 
            return null;
        console.log("JE SUIS ICI");
        //room.roomAdministrators = [];
        //room.allowedUsersInRoom.push(user.id.toString());
        if (!data.password)
            data.password = null;
        else
        {
            console.log(data.roomName);
            console.log(data.password);
            console.log(data.publicRoom);
            const roomPaaswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
            if (!roomPaaswordPattern.test(data.password))
                return (null);
        }
        const room = new RoomEntity2();
        const password = data.password;
        console.log(data.roomName);
        console.log(data.password);
        console.log(data.publicRoom);
        room.allowedUsersInRoom = [];
        room.roomAdministrators = [];
        room.roomOwner = user.id.toString();
        console.log(user.id);
        room.roomAdministrators.push(user.id.toString());
        //room.password = await this.chatService.setPassword(data.password);
        //room.users.forEach(user => {room.allowedUsersInRoom.push(user.id.toString())});
        //room.users.push(user.id.toString())
        return this.roomsRepository.save(room);
    }
    /*===========================================================================*/
}