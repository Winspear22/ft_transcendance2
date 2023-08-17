import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomEntity } from './entities/room.entity';
import { UserEntity } from 'src/user/user.entity';
import { MessageEntity } from './entities/message.entity';
import * as colors from '../colors';

@Injectable()
export class RoomService 
{
    constructor(
        @InjectRepository(RoomEntity)
        private roomRepository: Repository<RoomEntity>,
    ) {}

    /**
     * Récupère tous les membres d'une room spécifiée par son ID.
     */
    async getAllMembersFromRoom(roomName: string): Promise<UserEntity[]> {
        const room = await this.roomRepository.findOne({ where: { name: roomName }, relations: ['members'] });
        if (!room) {
            throw new Error('Room not found');
        }
        //console.log(colors.BRIGHT, colors.BLUE, "getAllMembersFromRoom : ", colors.WHITE, room, colors.RESET)
        return room.members;
    }

    /**
     * Récupère un membre spécifique d'une room spécifiée par son ID.
     */
    async getSpecificMemberOfRoom(roomName: string, memberId: number): Promise<UserEntity | undefined> {
        const room = await this.roomRepository.findOne({ where: { name: roomName }, relations: ['members'] });
        if (!room) {
            throw new Error('Room not found');
        }
        const user = room.members.find(member => member.id === memberId);
        console.log("J'ai trouve cet utilisateur === ", user);
        //console.log(colors.BRIGHT, colors.BLUE, "getSpecificMemberOfRoom : ", colors.WHITE, room, colors.RESET)
        return room.members.find(member => member.id === memberId);
    }

    /**
     * Récupère tous les messages écrits dans une room spécifiée par son ID.
     */
    async getMessagesOfRoom(roomName: string): Promise<MessageEntity[]> {
        const room = await this.roomRepository.findOne({ where: { name: roomName }, relations: ['messages'] });
        if (!room) {
            throw new Error('Room not found');
        }
        console.log(colors.BRIGHT, colors.BLUE, "getMessagesOfRoom : ", colors.WHITE, room, colors.RESET)
        return room.messages;
    }

    async getRoomById(roomId: number): Promise<RoomEntity> {
        return await this.roomRepository.findOneBy({ id: roomId });
    }

    async getRoomByName(roomName: string): Promise<RoomEntity | undefined> {
        const room = await this.roomRepository.findOneBy({ name: roomName });
        if (!room)
            return undefined;
        return await this.roomRepository.findOneBy({ name: roomName });
    }

    /**
    * Cree une room et l'ajoute a la base de donnees.
    */

    async createRoom(name: string, members?: UserEntity[]): Promise<RoomEntity> {
        const room = new RoomEntity();
        room.name = name;
        if (members) {
            room.members = members;
        }
        console.log(room);
        return await this.roomRepository.save(room);
    }

    /**
    * Ajoute les utilisateurs a la room et sauvegarde qui est present dans la room
    */

    async addUserToRoom(roomName: string, user: UserEntity): Promise<void> {
        const room = await this.roomRepository.findOne({ where: { name: roomName }, relations: ['members'] });
        if(!room.members.includes(user)) {
            room.members.push(user);
        }
        await this.roomRepository.save(room);
    }

    async deleteUserFromRoom(roomName: string, user: UserEntity): Promise<void> {
        const room = await this.roomRepository.findOne({ where: { name: roomName }, relations: ['members'] });
        if (!room) {
            throw new Error('Room not found');
        }
        room.members = room.members.filter(member => member.id !== user.id);
        await this.roomRepository.save(room);
    }

    /**
    * Supprime la room
    */

    async deleteRoom(roomName: string): Promise<void> {
        const room = this.getRoomByName(roomName);
        await this.roomRepository.delete((await room).id);
    }
}
