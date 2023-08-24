import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomEntity } from './entities/room.entity';
import { UserEntity } from 'src/user/user.entity';
import * as colors from '../colors';
import * as bcrypt from 'bcryptjs';


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

    async setPassword(password: string): Promise<string>
    {
        if (password == null)
            return (null);
        if (typeof password !== "string") 
        {
            console.log("Invalid password:", password);
            throw new Error("Password must be a string");
        }
        const saltRounds = 12;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPaasword = await bcrypt.hash(password, salt);
        return (hashedPaasword);
    }

    async verifyPassword(realPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(realPassword, hashedPassword);
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

    async createRoom(data: { roomName: string, 
    password: string, publicRoom: boolean },
    creator: UserEntity): Promise<RoomEntity> 
    {
        const room = new RoomEntity();
        try
        {
            const roomNamePattern = /^[a-zA-Z0-9]{2,12}$/;
            if (!roomNamePattern.test(data.roomName))
                throw new Error('Error. Wrong room name. Use only alphanumeric characters with a length of 2-12 characters.');
            if (data.password)
                room.password = await this.setPassword(data.password);
            else
                room.password = null;
            room.name = data.roomName;
            room.publicRoom = data.publicRoom;
            room.roomCreator = creator;
            room.roomCurrentAdmin = creator;
        }
        catch (error) 
        {
          console.error(error);
          return (null);
        }

        return await this.roomRepository.save(room);
    }

    /**
    * Ajoute les utilisateurs a la room et sauvegarde qui est present dans la room
    */

    async addUserToRoominDb(roomName: string, user: UserEntity): Promise<void> {
        const room = await this.roomRepository.findOne({ where: { name: roomName }, relations: ['members'] });
        if(!room.members.includes(user)) {
            room.members.push(user);
        }
        await this.roomRepository.save(room);
    }

    async deleteUserFromRoominDb(roomName: string, user: UserEntity): Promise<void> {
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

    async setNewAdminForRoom(roomName: string, newAdmin: UserEntity): Promise<RoomEntity> 
    {
        const room = await this.roomRepository.findOne({ where: { name: roomName } });
    
        if (!room) {
            throw new Error('Room not found');
        }
    
        room.roomCurrentAdmin = newAdmin;
    
        return await this.roomRepository.save(room);
    }
}
