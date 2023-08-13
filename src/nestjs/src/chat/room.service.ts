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
    async getAllMembersFromRoom(roomId: number): Promise<UserEntity[]> {
        const room = await this.roomRepository.findOne({ where: { id: roomId }, relations: ['members'] });
        if (!room) {
            throw new Error('Room not found');
        }
        console.log(colors.BRIGHT, colors.BLUE, "getAllMembersFromRoom : ", colors.WHITE, room, colors.RESET)
        return room.members;
    }

    /*async getASpecificDataFromUserInRoom(dataWanted: string, roomId: number)
    {
        const allClientsFromRoom = this.getAllMembersFromRoom(roomId); 
        const info = (await allClientsFromRoom).forEach(user => {
            console.log("JE SUIS LE USER === ", user.username);
          });;
    }*/

    /**
     * Récupère un membre spécifique d'une room spécifiée par son ID.
     */
    async getSpecificMemberOfRoom(roomId: number, memberId: number): Promise<UserEntity | undefined> {
        const room = await this.roomRepository.findOne({ where: { id: roomId }, relations: ['members'] });
        if (!room) {
            throw new Error('Room not found');
        }
        console.log(colors.BRIGHT, colors.BLUE, "getSpecificMemberOfRoom : ", colors.WHITE, room, colors.RESET)
        return room.members.find(member => member.id === memberId);
    }

    /**
     * Récupère tous les messages écrits dans une room spécifiée par son ID.
     */
    async getMessagesOfRoom(roomId: number): Promise<MessageEntity[]> {
        const room = await this.roomRepository.findOne({ where: { id: roomId }, relations: ['messages'] });
        if (!room) {
            throw new Error('Room not found');
        }
        console.log(colors.BRIGHT, colors.BLUE, "getMessagesOfRoom : ", colors.WHITE, room, colors.RESET)
        return room.messages;
    }

    async getRoomById(roomId: number): Promise<RoomEntity> {
        return await this.roomRepository.findOneBy({ id: roomId });
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

    async addUserToRoom(roomId: number, user: UserEntity): Promise<void> {
        const room = await this.roomRepository.findOne({ where: { id: roomId }, relations: ['members'] });
        if(!room.members.includes(user)) {
            room.members.push(user);
        }
        await this.roomRepository.save(room);
    }

    async deleteUserFromRoom(roomId: number, user: UserEntity): Promise<void> {
        // Trouver la salle par son ID et obtenir ses membres
        const room = await this.roomRepository.findOne({ where: { id: roomId }, relations: ['members'] });
        
        if (!room) {
            throw new Error('Room not found');
        }
    
        // Filtrer les membres pour exclure l'utilisateur spécifié
        room.members = room.members.filter(member => member.id !== user.id);
    
        // Sauvegarder la salle mise à jour
        await this.roomRepository.save(room);
    }

    /**
    * Supprime la room
    */

    async deleteRoom(roomId: number): Promise<void> {
        await this.roomRepository.delete(roomId);
    }
}
