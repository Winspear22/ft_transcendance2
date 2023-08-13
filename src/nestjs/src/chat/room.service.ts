import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomEntity } from './entities/room.entity';
import { UserEntity } from 'src/user/user.entity';
import { MessageEntity } from './entities/message.entity';
import * as colors from '../colors';

@Injectable()
export class RoomService {

    constructor(
        @InjectRepository(RoomEntity)
        private roomRepository: Repository<RoomEntity>,
    ) {}

    /**
     * Récupère tous les membres d'une room spécifiée par son ID.
     */
    async getMembersOfRoom(roomId: number): Promise<UserEntity[]> {
        const room = await this.roomRepository.findOne({ where: { id: roomId }, relations: ['members'] });
        if (!room) {
            throw new Error('Room not found');
        }
        console.log(colors.BRIGHT, colors.BLUE, "getMembersOfRoom : ", colors.WHITE, room, colors.RESET)
        return room.members;
    }

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
}
