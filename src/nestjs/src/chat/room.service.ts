import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomEntity } from './entities/room.entity';
import { UserEntity } from 'src/user/user.entity';
import * as colors from '../colors';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/user/user.service';


@Injectable()
export class RoomService 
{
    constructor(
        @InjectRepository(RoomEntity)
        private roomRepository: Repository<RoomEntity>,
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
        private userService: UserService
        
    ) {}

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

    async getSpecificMemberOfRoomByUsername(roomName: string, memberUsername: string): Promise<UserEntity | undefined> {
        const room = await this.roomRepository.findOne({ where: { name: roomName }, relations: ['members'] });
        
        if (!room) {
            throw new Error('Room not found');
        }
        
        const user = room.members.find(member => member.username === memberUsername);
        console.log("J'ai trouvé cet utilisateur === ", user);
        
        return user;
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
            //room.roomCurrentAdmin = creator;
        }
        catch (error) 
        {
          console.error(error);
          return (null);
        }
        console.log(room);
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

    /*=====================SETTERS=====================*/
    /*--------------------PASSWORD---------------------*/
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
    
    /*------------------ROOM-CREATOR-------------------*/
    async setRoomCreator(name: string, id: number): Promise<UserEntity> {
        const room = await this.getRoomByName(name);
        if (!room) {
            throw new Error(`Room with ID ${name} not found.`);
        }
    
        const user = await this.userService.findUserById(id); // Supposant que vous avez un userRepository pour les utilisateurs
        if (!user) {
            throw new Error(`User with ID ${id} not found.`);
        }
        room.roomCreator = user;
        await this.roomRepository.save(room);
        return user;
    }

    async getRoomCreator(name: string): Promise<UserEntity | null> {
        const room = await this.roomRepository.findOne({
            where: { name: name },
            relations: ["roomCreator"]
        });
    
        if (!room) {
            return undefined;
            //throw new Error(`Room with name ${name} not found. toto`);
        }
    
        return room.roomCreator;
    }
    /*------------------ROOM-ADMINS-------------------*/
    async setRoomAdministrator(roomName: string, userId: number): Promise<void> {
        const room = await this.roomRepository.findOne({
            where: { name: roomName },
            relations: ["roomCurrentAdmins"] // Assurez-vous de charger les administrateurs actuels de la salle.
        });
    
        if (!room) {
            throw new Error(`Room with name ${roomName} not found.`);
        }
    
        const user = await this.userService.findUserById(userId); // Utilisez la fonction pour obtenir un utilisateur unique.
    
        if (!user) {
            throw new Error(`User with ID ${userId} not found.`);
        }
    
        // Vérifiez si l'utilisateur est déjà administrateur pour éviter les doublons.
        if (room.roomCurrentAdmins.some(admin => admin.id === userId)) {
            throw new Error(`User with ID ${userId} is already an administrator for the room ${roomName}.`);
        }
    
        room.roomCurrentAdmins.push(user);
        await this.roomRepository.save(room);
    }

    async unsetRoomAdministrator(roomName: string, userId: number): Promise<void> {
        const room = await this.roomRepository.findOne({
            where: { name: roomName },
            relations: ["roomCurrentAdmins"] // Assurez-vous de charger les administrateurs actuels de la salle.
        });
    
        if (!room) {
            throw new Error(`Room with name ${roomName} not found.`);
        }
    
        const user = await this.userService.findUserById(userId); // Utilisez la fonction pour obtenir un utilisateur unique.
    
        if (!user) {
            throw new Error(`User with ID ${userId} not found.`);
        }
    
        // Vérifiez si l'utilisateur est effectivement un administrateur.
        const adminIndex = room.roomCurrentAdmins.findIndex(admin => admin.id === userId);
        if (adminIndex === -1) {
            throw new Error(`User with ID ${userId} is not an administrator for the room ${roomName}.`);
        }
    
        room.roomCurrentAdmins.splice(adminIndex, 1); // Supprimez l'utilisateur de la liste des administrateurs.
        await this.roomRepository.save(room);
    }
    

    async getRoomAdministrators(name: string): Promise<UserEntity[]> {
        const room = await this.roomRepository.findOne({
            where: { name: name },
            relations: ["roomCurrentAdmins"]
        });
    
        if (!room) {
            throw new Error(`Room with name ${name} not found.`);
        }
    
        return room.roomCurrentAdmins;
    }

    async isUserAdminOfRoom(roomName: string, username: string): Promise<boolean> {
        const room = await this.roomRepository.findOne({
            where: { name: roomName },
            relations: ["roomCurrentAdmins"]
        });
    
        if (!room) {
            throw new Error(`Room with name ${roomName} not found.`);
        }
    
        const isAdmin = room.roomCurrentAdmins.some(admin => admin.username === username);
        return isAdmin;
    }

}
