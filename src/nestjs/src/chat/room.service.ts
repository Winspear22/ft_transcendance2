import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomEntity } from './entities/room.entity';
import { UserEntity } from 'src/user/user.entity';
import * as colors from '../colors';
import * as bcrypt from 'bcryptjs';
import { ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MessageEntity } from './entities/message.entity';
import { UserDTO } from './entities/room.entity';
import { In } from 'typeorm';

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
        const userdto = { username: user.username, id: user.id };
        const userId = user.id;
        const newRoom: Partial<RoomEntity> = {
            roomName: channelName,
            password: hasPassword ? password : null,
            isPrivate: isPrivate,
            owner: userId,
            roomMode: isPrivate ? 'private' : 'public',
            users: [userId], // initialiser avec l'ID de l'utilisateur propriétaire
            userDTOs: [userdto],
            admins: [userId], // initialiser avec l'ID de l'utilisateur propriétaire
            bannedIds: [],
            mutedIds: [],
            pendingIds: []
          };
        user.createdRoomsCount++;
        await this.roomRepository.save(newRoom);
        await this.usersRepository.save(user);
        return { success: true };
    }    

    async joinRoom(body: { 
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
        if (room.password && room.password !== '') {
          if (!bcrypt.compareSync(password, room.password)) {
            console.log("je suis ici");
            return { success: false, error: 'Invalid password' };
          }
        }
        console.log("password passe");
        const userInRoom = room.users.find(id => id === user.id);
        if (userInRoom) {
          return { success: true };
        }
        room.users.push(user.id);
        const userDTO = { username: user.username, id: user.id };
        room.userDTOs.push(userDTO);
        console.log(room.userDTOs);
        await this.roomRepository.save(room);
        return { success: true };
    }

  async quitRoom(body: { 
  channelName: string; }, 
  @ConnectedSocket() client: Socket) 
  {
    const { channelName } = body;

    const user = client.data.user;
    const room = await this.getRoomByName(channelName);
    if (!room) {
        return { success: false, error: 'Channel not found' };
    }

    if (user.id === room.owner) {
        // Si l'utilisateur est le propriétaire de la salle, supprimez tous les messages du canal 
        // et ensuite le canal lui-même
        user.createdRoomsCount--;
        await this.usersRepository.save(user);
        await this.messagesRepository.delete({ channelId: room.id });
        await this.roomRepository.delete({ id: room.id });
        
        return { success: true };
    } else {
        // Si l'utilisateur n'est pas le propriétaire, retirez-le des listes 'users' et 'userDTOs'
        room.users = room.users.filter(id => id !== user.id);
        room.userDTOs = room.userDTOs.filter(userDTO => userDTO.id !== user.id);

        await this.roomRepository.save(room);
        return { success: true };
    }
  }


  //--------------------------------------------------------------------------------------//
  //-------------------------------------ROOM GETTERS-------------------------------------//
  //--------------------------------------------------------------------------------------//
  async getRooms(@ConnectedSocket() client: Socket) 
  {
    const user = client.data.user;
    const channels = await this.roomRepository.find({
        where: {
          isPrivate: false,
      }
    });
    /*const filteredChannels = channels.filter(channel => 
        !channel.users.includes(user.id) || 
        (channel.isPrivate && channel.users.includes(user.id))
    );*/

    const filteredChannels = channels.filter(channel => 
      (!channel.users.includes(user.id) && !channel.bannedIds.includes(user.id)) || 
      (channel.isPrivate && channel.users.includes(user.id)));
        
  //const filteredChannels = channels.filter(channel => !channel.bannedIds.includes(user.id) || !channel.users.includes(user.id)
//);

    const retChannels = filteredChannels.map(channel => ({
      channelName: channel.roomName,
    users: channel.users.length,
    owner: channel.owner,
    hasPassword: !!channel.password,
    }));
    return { success: true, channels: retChannels };
  }
    
  getSocketFromUserId(
      userId: number,
      ref_client: Map<number, string>, 
      ref_Socket: Map<Socket, string>
  ): Socket | undefined {
      const socketId = ref_client.get(userId);
      if (!socketId) return undefined;
  
      return [...ref_Socket.keys()].find(socket => ref_Socket.get(socket) === socketId);
  }

  async GetSocketsInRoom(@MessageBody() data: { channelName: string },
  ref_client: Map<number, string>, 
  ref_Socket: Map<Socket, string>): Promise<Socket[]> {
    // Récupérer l'entité de la room en utilisant l'ID de la room.
    const room = await this.getRoomByName(data.channelName);

    if (!room) {
        console.error(`Room with ID ${data.channelName} not found.`);
        return [];
    }

    // Récupérer tous les sockets des utilisateurs présents dans la room.
    const sockets: Socket[] = [];
    for (const userId of room.users) {
        const socket = this.getSocketFromUserId(userId, ref_client, ref_Socket);
        if (socket) {
            sockets.push(socket);
        }
    }

    return sockets;
}


    
  //--------------------------------------------------------------------------------------//

  //--------------------------------------------------------------------------------------//
  //-----------------------------POUVOIRS DES OWNERS/ADMINS-------------------------------//
  //--------------------------------------------------------------------------------------//

  //------------------------------BANNIR/DEBANNIR LES USERS-------------------------------//
    
  async banUserfromRoom(body: {
  channelName: string,
  targetUsername: string }, @ConnectedSocket() client: Socket)
  {
    const user = client.data.user;
    const room = await this.getRoomByName(body.channelName);
    if (!room) {
        return { success: false, error: 'Channel not found' };
    }

    if (room.owner !== user.id && !room.admins.includes(user.id)) {
        return { success: false, error: 'You are not admin' };
    }

    const targetUser = await this.usersRepository.findOne({ where: { username: body.targetUsername } });
    if (!targetUser) {
        return { success: false, error: 'Target user not found' };
    }

    if (targetUser.id === room.owner) {
        return { success: false, error: 'Cannot ban owner' };
    }

    if (!room.users.includes(targetUser.id)) {
        return { success: false, error: 'Target user is not in this channel' };
    }

    if (room.admins.includes(targetUser.id)) {
        if (room.owner === user.id) {
            room.users = room.users.filter(id => id !== targetUser.id);
            room.bannedIds.push(targetUser.id);
            await this.roomRepository.save(room);
            return { success: true };
        } else {
            return { success: false, error: 'Cannot ban another admin' };
        }
    }
    room.users = room.users.filter(id => id !== targetUser.id);
    room.bannedIds.push(targetUser.id);
    await this.roomRepository.save(room);

    return { success: true };
  }

  async unbanUserfromRoom(body: {
    channelName: string,
    targetUsername: string }, @ConnectedSocket() client: Socket)
  {
    const user = client.data.user;
    const room = await this.getRoomByName(body.channelName);
    if (!room) {
      return { success: false, error: 'Channel not found' };
    }
  
    if (room.owner !== user.id && !room.admins.includes(user.id)) {
      return { success: false, error: 'You are not admin' };
    }
  
    const targetUser = await this.usersRepository.findOne({ where: { username: body.targetUsername } });
    if (!targetUser) {
      return { success: false, error: 'Target user not found' };
    }
  
    if (!room.bannedIds.includes(targetUser.id)) {
      return { success: false, error: 'Target user is not banned from this channel' };
    }
  
    room.bannedIds = room.bannedIds.filter(id => id !== targetUser.id);
    await this.roomRepository.save(room);
  
    return { success: true };
  }
  
  //--------------------------------------------------------------------------------------//

  //------------------------------------KICK LES USERS------------------------------------//


  async kickUserChannel(body: { 
  channelName: string; 
  targetUsername: string; }, @ConnectedSocket() client: Socket)
  {
    const user = client.data.user;
    const room = await this.getRoomByName(body.channelName); // Supposons que cette fonction fait un appel à votre propre base de données
    
    if (!room) {
        return { success: false, error: 'Channel not found' };
    }
    
    if (room.owner !== user.id && !room.admins.includes(user.id)) {
        return { success: false, error: 'You are not admin' };
    }
    const targetUser = await this.usersRepository.findOne({ where: { username: body.targetUsername } });
    if (!targetUser) {
        return { success: false, error: 'Target user not found' };
    }
    if (targetUser.id === room.owner) {
        return { success: false, error: 'Cannot kick owner' };
    }
    if (!room.users.includes(targetUser.id)) {
        return { success: false, error: 'Target user is not in this channel' };
    }
    if (room.admins.includes(targetUser.id)) {
        if (room.admins.includes(user.id)) {
            return { success: false, error: 'Cannot kick another admin' };
        } 
        else if (room.owner === user.id) {
            room.users = room.users.filter(id => id !== targetUser.id);
            await this.roomRepository.save(room);
            return { success: true };
        }
        else {
            return { success: false, error: 'You are not admin' };
        }
    }
    room.users = room.users.filter(id => id !== targetUser.id);
    await this.roomRepository.save(room);
    return { success: true };
  }
  
  //--------------------------------------------------------------------------------------//

  //------------------------------------MUTE LES USERS------------------------------------//

  async muteUserRoom(body: { 
  username: string; 
  channelName: string; 
  targetUsername: string; 
  duration: number }) 
  {
  // Vérifie si l'utilisateur essaie de se mettre en sourdine lui-même
  if (body.username === body.targetUsername) 
      return { success: false, error: 'Cannot mute yourself' };
  // Récupère l'utilisateur demandeur à partir de la base de données
  const user = await this.usersRepository.findOne({ where: { username: body.username } });
  // Vérifie si l'utilisateur demandeur existe
  if (!user) 
      return { success: false, error: 'User not found' };
  // Récupère la salle à partir de la base de données
  const room = await this.roomRepository.findOne({ where: { roomName: body.channelName }});
  // Vérifie si la salle existe
  if (!room)
      return { success: false, error: 'Room not found' };
  // Vérifie si l'utilisateur demandeur est propriétaire ou administrateur de la salle
  if (room.owner !== user.id && !room.admins.includes(user.id))
      return { success: false, error: 'You are not an admin' };
  // Récupère l'utilisateur cible à partir de la base de données  
  const targetUser = await this.usersRepository.findOne({ where: { username: body.targetUsername } });
  // Vérifie si l'utilisateur cible existe
  if (!targetUser)
      return { success: false, error: 'Target user not found' };
  // Vérifie si l'utilisateur cible est le propriétaire de la salle
  if (targetUser.id === room.owner)
      return { success: false, error: 'Cannot mute owner' };
  // Vérifie si l'utilisateur cible est dans la salle
  if (!room.users.includes(targetUser.id))
      return { success: false, error: 'Target user is not in this room' };
  if (room.mutedIds.includes(targetUser.id))
    return { success: false, error: 'Target already muted'};
  // Si l'utilisateur cible est un administrateur, vérifie si l'utilisateur demandeur est le propriétaire
  if (room.admins.includes(targetUser.id)) {
      if (room.owner === user.id) {
          room.mutedIds = [...room.mutedIds, targetUser.id];
          await this.roomRepository.save(room);
          
          // Démarrage du timer pour la durée de la mise en sourdine
          setTimeout(async () => {
              const idx = room.mutedIds.indexOf(targetUser.id);
              if (idx !== -1) {
                  room.mutedIds.splice(idx, 1);
                  await this.roomRepository.save(room);
              }
          }, body.duration * 1000);
          return { success: true };
      } else {
          return { success: false, error: 'Cannot mute another admin' };
      }
  }
  // Ajoute l'ID de l'utilisateur cible à la liste des IDs en sourdine
  room.mutedIds = [...room.mutedIds, targetUser.id];
  await this.roomRepository.save(room);
  // Démarrage du timer pour la durée de la mise en sourdine
  setTimeout(async () => {
      const idx = room.mutedIds.indexOf(targetUser.id);
      if (idx !== -1) {
          room.mutedIds.splice(idx, 1);
          await this.roomRepository.save(room);
      }
  }, body.duration * 1000);
  return { success: true };
}

async unmuteUserRoom(body: { 
  username: string, 
  channelName: string, 
  targetUsername: string}) 
  {
    // Récupère l'utilisateur demandeur à partir de la base de données
    const user = await this.usersRepository.findOne({ where: { username: body.username } });
    
    if (!user) return { success: false, error: 'User not found' };

    const room = await this.roomRepository.findOne({ where: { roomName: body.channelName }});
    
    if (!room) return { success: false, error: 'Room not found' };
    
    if (room.owner !== user.id && !room.admins.includes(user.id))
        return { success: false, error: 'You are not an admin' };

    const targetUser = await this.usersRepository.findOne({ where: { username: body.targetUsername } });
    
    if (!targetUser)
        return { success: false, error: 'Target user not found' };
    if (targetUser.id === room.owner)
        return { success: false, error: 'Cannot unmute owner' };
    if (!room.users.includes(targetUser.id))
        return { success: false, error: 'Target user is not in this room' };

    const idx = room.mutedIds.indexOf(targetUser.id);
    
    if (idx !== -1) {
        room.mutedIds.splice(idx, 1);
        await this.roomRepository.save(room);
    } else {
        return { success: false, error: 'User is not muted' };
    }

    return { success: true };
  }

  async promoteUserInRoom(userId: number,  channelName: string, targetUserId: number ) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
        return { success: false, error: 'User not found' };
    }

    const room = await this.roomRepository.findOne({
        where: { roomName: channelName },
        select: ['users', 'owner', 'admins', 'id'],
    });
    if (!room) {
        return { success: false, error: 'Room not found' };
    }

    if (user.id !== room.owner) {
        return { success: false, error: 'You are not the owner of this room' };
    }

    const targetUser = await this.usersRepository.findOne({ where: { id: targetUserId } });
    if (!targetUser) {
        return { success: false, error: 'Target user not found' };
    }

    if (!room.users.includes(targetUser.id)) {
        return { success: false, error: 'Target user is not a member of this room' };
    }

    if (room.admins.includes(targetUser.id)) {
        return { success: false, error: 'Target user is already an admin of this room' };
    }

    if (room.owner === targetUser.id) {
        return { success: false, error: 'Target user is the owner of the room' };
    }

    room.admins.push(targetUser.id);
    await this.roomRepository.save(room);

    return ({ success: true });
  }

  async demoteUserInRoom(userId: number, roomName: string, targetUserId: number) {
    // Trouver l'utilisateur propriétaire
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
        return { success: false, error: 'User not found' };
    }

    // Trouver la salle
    const room = await this.roomRepository.findOne({
        where: { roomName: roomName },
        select: ['users', 'owner', 'admins', 'id'],
    });
    if (!room) {
        return { success: false, error: 'Room not found' };
    }

    // Vérifier si l'utilisateur est le propriétaire de la salle
    if (user.id !== room.owner) {
        return { success: false, error: 'You are not the owner of this room' };
    }

    // Trouver l'utilisateur cible
    const targetUser = await this.usersRepository.findOne({ where: { id: targetUserId } });
    if (!targetUser) {
        return { success: false, error: 'Target user not found' };
    }

    // Vérifier si l'utilisateur cible est membre de la salle
    if (!room.users.includes(targetUser.id)) {
        return { success: false, error: 'Target user is not a member of this room' };
    }

    // Vérifier si l'utilisateur cible est déjà un admin de la salle
    if (!room.admins.includes(targetUser.id)) {
        return { success: false, error: 'Target user is not an admin of this room' };
    }

    if (userId === targetUserId && room.admins.includes(user.id)) {
      return { success: false, error: 'An admin cannot demote themselves' };
    }

    // Retirer l'utilisateur cible des admins de la salle
    room.admins = room.admins.filter(id => id !== targetUser.id);
    await this.roomRepository.save(room);

    return { success: true };
  }


}