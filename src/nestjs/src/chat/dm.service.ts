import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomEntity } from './entities/room.entity';
import { UserEntity } from 'src/user/user.entity';
import * as colors from '../colors';
import { ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { FriendChat } from 'src/user/entities/friendchat.entity';


@Injectable()
export class DMService 
{
    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
        @InjectRepository(FriendChat)
        private friendChatsRepository: Repository<FriendChat>,

        
    ) {}

    async getFriendChat(username: string, friendUsername: string): 
    Promise<{ success: boolean, chat?: { room: string, messages: any[] } }> {
        const user = await this.usersRepository.findOne({ where: { username }, relations: ['friends'] });
        
        const friend = await this.usersRepository.findOne({ where: { username: friendUsername }, select: ['id'] });
        const messages = [];
        
        for (const friendEntity of user.friends) {
          if (friendEntity.friendId === friend.id) {
            const chat = await this.friendChatsRepository.findOne({ where: { id: friendEntity.chatId }, relations: ['messages'] });
            
            for (const message of chat.messages) {
              const sender = await this.usersRepository.findOne({ where: { id: message.senderId }, select: ['username', 'profile_picture'] });
              messages.push({
                senderId: message.senderId,
                text: message.text,
                time: message.createdAt,
                username: sender.username,
                avatar: sender.profile_picture
              });
            }
            
            return {
              success: true,
              chat: {
                room: chat.room,
                messages
              }
            };
          }
        }
      }

      /*async getAllChatRoomsForUser(username: string): Promise<{ success: boolean, chats?: FriendChat[] }> {
        try {
          // Trouver l'utilisateur par son nom d'utilisateur
          const user = await this.usersRepository.findOne({ where: { username } });
          
          // Vérifier si l'utilisateur existe
          if (!user) {
            return { success: false };
          }
      
          // Trouver toutes les salles de chat où cet utilisateur est présent
          const chats = await this.friendChatsRepository.find({
            relations: ['users'],
            where: (qb) => {
              qb.where(':userId = ANY(users.id)', { userId: user.id });
            }
          });
      
          return {
            success: true,
            chats
          };
        } catch (error) {
          console.error(error);
          return { success: false };
        }
      }*/

      async getAllChatRoomsForUser(username: string): Promise<{ success: boolean, chats?: FriendChat[] }> {
        try {
          // Trouver l'utilisateur par son nom d'utilisateur
          const user = await this.usersRepository.findOne({ where: { username } });
          
          // Vérifier si l'utilisateur existe
          if (!user) {
            return { success: false };
          }
      
          // Trouver toutes les salles de chat où cet utilisateur est présent
          const chats = await this.friendChatsRepository
            .createQueryBuilder('friendChat')
            .innerJoinAndSelect('friendChat.users', 'user', 'user.id = :userId', { userId: user.id })
            .getMany();
      
          return {
            success: true,
            chats
          };
        } catch (error) {
          console.error(error);
          return { success: false };
        }
      }
      
      
      
      async getFriendId(username: string, friendUsername: string): 
      Promise<{ success: boolean, id?: number }> {
        try {
          const user = await this.usersRepository.findOne({ where: { username } });
      
          const friend = await this.usersRepository.findOne({ where: { username: friendUsername }, select: ['id'] });
          return { success: true, id: friend.id };
        } catch (error) {
          console.error('Error in getFriendId:', error);
        }  
    }
}