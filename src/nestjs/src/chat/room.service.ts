import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomEntity } from './entities/room.entity';
import { UserEntity } from 'src/user/user.entity';
import * as colors from '../colors';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/user/user.service';
import { ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MessageEntity } from './entities/message.entity';


@Injectable()
export class RoomService 
{
    constructor(
        @InjectRepository(RoomEntity)
        private roomRepository: Repository<RoomEntity>,
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
        @InjectRepository(MessageEntity)
        private messagesRepository: Repository<MessageEntity>,
        private userService: UserService
        
    ) {}

    async getRoomById(roomId: number): Promise<RoomEntity> {
        return await this.roomRepository.findOneBy({ id: roomId });
    }

    async getRoomByName(roomName: string): Promise<RoomEntity | undefined> {
        const room = await this.roomRepository.findOneBy({ roomName: roomName });
        if (!room)
            return undefined;
        return await this.roomRepository.findOneBy({ roomName: roomName });
    }

    async createRoom(body: { 
    channelName: string,
    hasPassword: boolean, 
    password?: string,
    isPrivate: boolean }, @ConnectedSocket() client: Socket) 
    {
        const { channelName, hasPassword, password, isPrivate } = body;
        let room = await this.getRoomByName(channelName);
        if (room) {
            return { success: false, error: 'Channel already exists' };
        }
        const user = client.data.user;
        const userId = user.id;
        const newRoom: Partial<RoomEntity> = {
            roomName: channelName,
            password: hasPassword ? password : null,
            isPrivate: isPrivate,
            owner: userId,
            roomMode: isPrivate ? 'private' : 'public',
            users: [userId], // initialiser avec l'ID de l'utilisateur propriétaire
            admins: [userId], // initialiser avec l'ID de l'utilisateur propriétaire
            bannedIds: [],
            mutedIds: [],
            pendingIds: []
          };
        await this.roomRepository.save(newRoom);
        return { success: true };
    }    

    async joinChannel(body: { 
    channelName: string, 
    password?: string; }, 
    @ConnectedSocket() client: Socket) 
    {
        const { password } = body;
        
        const user = client.data.user;
        const room = await this.getRoomByName(body.channelName);
        if (!room) {
            return { success: false, error: 'Channel not found' };
        }
    
        if (room.bannedIds.includes(user.id)) {
          return { success: false, error: 'You are banned from this channel' };
        }
    
        console.log("l'utilisateur n'etait pas dans la room");
        console.log("passwords : ", password, " room password : ", room.password);
        /*if (room.password && room.password !== '') {
          if (!bcrypt.compareSync(password, room.password)) {
            console.log("je suis ici");
            return { success: false, error: 'Invalid password' };
          }
        }*/
        if (room.password && room.password !== '')
        {
            if (room.password != password)
                return { success: false, error: 'Invalid password' };
        }
        console.log("password passe");
        const userInRoom = room.users.find(id => id === user.id);
        if (userInRoom) {
          return { success: true };
        }
    
        room.users.push(user.id);
        await this.roomRepository.save(room);
        return { success: true };
    }

    async quitChannel(body: { 
        channelName: string; }, 
        @ConnectedSocket() client: Socket) {
        const { channelName } = body;
        
        const user = client.data.user;
        const room = await this.getRoomByName(channelName);
        if (!room) {
            return { success: false, error: 'Channel not found' };
        }
    
        if (user.id === room.owner) {
            // Supprimez tous les messages du canal et ensuite le canal lui-même
            await this.messagesRepository.delete({ id: room.id });
            await this.roomRepository.delete({ id: room.id });
            return { success: true };
        } else {
            room.users = room.users.filter(id => id !== user.id);
            await this.roomRepository.save(room);
            return { success: true };
        }
    }
    

    //--------------------------------------------------------------------------------------//
    //-------------------------------------ROOM GETTERS-------------------------------------//
    //--------------------------------------------------------------------------------------//
    async getYourRooms(@ConnectedSocket() client: Socket) {
    
        const user = client.data.user;
        
        // Trouver tous les channels où l'utilisateur est présent
        const channels = await this.roomRepository.find({
          where: {
            users: user.id,
          }
        });
    
        const channelNames = channels.map(channel => ({ channelName: channel.roomName }));
        return { success: true, yourChannels: channelNames };
      }
    
      async getRooms(@ConnectedSocket() client: Socket) {
        
        const user = client.data.user;    
        const channels = await this.roomRepository.find({
          where: {
            isPrivate: false,
          }
        });
    
        const retChannels = channels.map(channel => ({
          channelName: channel.roomName,
          users: channel.users.length,
          owner: channel.owner,
          hasPassword: !!channel.password,
        }));
    
        return { success: true, channels: retChannels };
      }
    
      async getRoomMessages(body: { roomName: string; }, @ConnectedSocket() client: Socket) {
        const { roomName } = body;
    
        const user = client.data.user;        
        // Votre logique d'authentification avec des jetons ici...
    
        const room = await this.roomRepository.findOne({
          where: { roomName },
          relations: ['messages']
        });
    
        if (!room) {
          return { success: false, error: 'Room not found' };
        }

        const retMessages = await Promise.all(room.messages.map(async (message) => {
        const sender = await this.usersRepository.findOne({ where: { id: message.senderId } });
        return {
            senderId: message.senderId,
            text: message.text,
            time: message.createdAt,
            username: sender.username,
            avatar: sender.profile_picture,
          };
        }));
    
        return { success: true, chat: { room: roomName, messages: retMessages } };
      }
    
    //--------------------------------------------------------------------------------------//

    //--------------------------------------------------------------------------------------//
    //----------------------------------OWNER/ADMIN POWERS----------------------------------//
    //--------------------------------------------------------------------------------------//

    async banUserChannel(body: {
        channelName: string;
        targetUsername: string; }, @ConnectedSocket() client: Socket)
        {
            const user = client.data.user;
            const room = await this.getRoomByName(body.channelName);
            if (!room) {
                return { success: false, error: 'Channel not found' };
            }
        
            if ((await room).owner !== user.id && !(await room).admins.includes(user.id)) {
                return { success: false, error: 'You are not admin' };
            }
        
            const targetUser = await this.usersRepository.findOne({ where: { username: body.targetUsername } });
            if (!targetUser) {
                return { success: false, error: 'Target user not found' };
            }
        
            if (targetUser.id === (await room).owner) {
                return { success: false, error: 'Cannot ban owner' };
            }
        
            if (!(await room).users.includes(targetUser.id)) {
                return { success: false, error: 'Target user is not in this channel' };
            }
        
            if ((await room).admins.includes(targetUser.id)) {
                if ((await room).owner === user.id) {
                    (await room).users = (await room).users.filter(id => id !== targetUser.id);
                    (await room).bannedIds.push(targetUser.id);
                    await this.roomRepository.save(room);
                    return { success: true };
                } else {
                    return { success: false, error: 'Cannot ban another admin' };
                }
            }
    
            (await room).users = (await room).users.filter(id => id !== targetUser.id);
            (await room).bannedIds.push(targetUser.id);
            await this.roomRepository.save(room);
        
            return { success: true };
        }
    
        async kickUserChannel(body: { 
        channelName: string; 
        targetUsername: string; }, @ConnectedSocket() client: Socket)
        {
    
            const user = client.data.user;
            const room = await this.getRoomByName(body.channelName); // Supposons que cette fonction fait un appel à votre propre base de données
            
            if (!room) {
                return { success: false, error: 'Channel not found' };
            }
            
            if ((await room).owner !== user.id && !(await room).admins.includes(user.id)) {
                return { success: false, error: 'You are not admin' };
            }
    
            const targetUser = await this.usersRepository.findOne({ where: { username: body.targetUsername } });
            if (!targetUser) {
                return { success: false, error: 'Target user not found' };
            }
    
            if (targetUser.id === (await room).owner) {
                return { success: false, error: 'Cannot kick owner' };
            }
    
            if (!(await room).users.includes(targetUser.id)) {
                return { success: false, error: 'Target user is not in this channel' };
            }
    
            if ((await room).admins.includes(targetUser.id)) {
                if ((await room).admins.includes(user.id)) {
                    return { success: false, error: 'Cannot kick another admin' };
                } 
                else if ((await room).owner === user.id) {
                    (await room).users = (await room).users.filter(id => id !== targetUser.id);
                    await this.roomRepository.save(room);
                    return { success: true };
                }
                else {
                    return { success: false, error: 'You are not admin' };
                }
            }
    
            (await room).users = (await room).users.filter(id => id !== targetUser.id);
            await this.roomRepository.save(room);
    
            return { success: true };
        }
        //--------------------------------------------------------------------------------------//
}
