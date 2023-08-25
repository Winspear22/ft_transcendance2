import { 
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import * as colors from '../colors';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/message.dto';
import { RoomService } from './room.service';
import { RoomEntity } from './entities/room.entity';
import { UseGuards } from '@nestjs/common';
import { ChatGuard } from './guard/chat-guard.guard';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';


@WebSocketGateway({cors: true, namespace: 'chats'})
export class ChatGateway 
{
  constructor(
    private readonly chatService: ChatService,
    private readonly roomService: RoomService,
    @InjectRepository(RoomEntity)
    private roomRepository: Repository<RoomEntity>,
    ) {}
  
  private ref_client = new Map<string, number>()



  @WebSocketServer()
  server: Server;
  
  @SubscribeMessage('message')
  handleMessage(@MessageBody() msg: string)
  {
    console.log("Message venant de la socket : ", msg);
    this.server.emit('message', msg);
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('Connection')
  async handleConnection(@ConnectedSocket() client: Socket) 
  {
    const user = await this.chatService.getUserFromSocket(client);
    if (user == undefined)
    {
      console.log(colors.BRIGHT + colors.RED, "Error. Socket id : " + colors.WHITE + client.id + colors.RED + " could not connect." + colors.RESET);
      return this.handleDisconnect(client);
    }
    console.log(colors.BRIGHT + colors.GREEN, "User : " +  colors.WHITE + user.username + colors .GREEN +" just connected." + colors.RESET);
    
    this.ref_client.set(client.id, user.id);
    console.log(colors.BRIGHT + colors.GREEN, "User id: " +  colors.WHITE + user.id + colors .GREEN +" User socket id : " + colors.WHITE + client.id + colors.RESET);
    console.log(colors.BRIGHT + colors.GREEN, "User id: " +  colors.WHITE + user.id + colors .GREEN +" User socket id is in the handleConnection function: " + colors.WHITE + client.id + colors.RESET);

  }

  handleDisconnect(client: Socket)
  {
    client.disconnect();
    console.log("User connected : ", colors.WHITE, client.id, " connection status : ", colors.FG_RED, client.connected, colors.RESET);
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('newMessage')
  async handleNewMessage(@MessageBody() data: CreateMessageDto, @ConnectedSocket() client: Socket) {
    console.log("data = ", data);
    const newMessage = await this.chatService.createMessage(data);
    
    console.log("Message = ", newMessage);
    this.server.emit('newMessage', newMessage);
    return { status: 'Message sent and saved' };
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('getAllMessages')
  async GetAllMessages() 
  {
    const messages = await this.chatService.getAllMessages();
    this.server.emit('getAllMessages', messages);
    return await this.chatService.getAllMessages();
  }
  
  /**
  * Permet de creer une room
  */
  @UseGuards(ChatGuard)
  @SubscribeMessage('createRoom')
  async handleCreateRoom(@MessageBody() data: { roomName: string, 
  password: string, publicRoom: boolean },
  @ConnectedSocket() client: Socket): Promise<RoomEntity | undefined> 
  {
    const roomName = await this.roomService.getRoomByName(data.roomName);
    if (roomName == undefined)
    {
      const room = await this.roomService.createRoom(data, client.data.user);
      client.join(room.name);
      room.roomCreator = await this.roomService.setRoomCreator(room.name, client.data.user.id);
      await this.roomService.addUserToRoominDb(room.name, client.data.user);
      this.server.emit("RoomCreationSuccess", "la room " + room.name + " a ete creee avec success !");
      return room;
    }
    else
    {
      this.server.emit("RoomCreationError", "La room " + roomName.name + " existe deja, par consequent elle n'a pas ete creee");
      return roomName;
    } 
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@MessageBody() data: { roomName: string, password: string },
  @ConnectedSocket() client: Socket): Promise<void> 
  {
    const room = await this.roomService.getRoomByName(data.roomName); // Supposant que vous avez une méthode getRoomById
    if (room) 
    {
      if ((room.password != null && await this.roomService.verifyPassword(data.password, room.password) === true) 
      || (room.password == null && data.password == null))
      {
        const user = await this.roomService.getSpecificMemberOfRoom(room.name, client.data.user.id); //pas sur de laisser l'id pour la fonction
        if (user != undefined)
        {
          this.server.emit("userJoinedRoomSuccess", "User " + client.data.user.username + " is already part of the room " + room.name + ".");
          return ;
        }
        client.join(room.name);
        await this.roomService.addUserToRoominDb(room.name, client.data.user);
        this.server.emit("userJoinedRoomSuccess", "User " + client.data.user.username + " joined room " + room.name + " successfully.");
      }
      else
        this.server.emit("userJoinedWrongPassword", "Error, wrong password.");
    }
    else
    {
      const message = "User " + client.data.user.username + "did not join room " + data.roomName + " because it does not exist.";
      this.server.emit("userJoinedRoomError", message);
      console.log(message);
    }
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('deleteRoom')
  async handleDeleteRoom(@MessageBody() data: { roomName: string }, 
  @ConnectedSocket() client: Socket): Promise<void> 
  {
    const room = await this.roomService.getRoomByName(data.roomName);
    if (room)
    {
      client.leave(room.name);
      await this.roomService.deleteUserFromRoominDb(data.roomName, client.data.user);
      await this.chatService.setUserAdminStatusOFF(client, room.id);
      await this.chatService.setUserCreatorStatusOFF(client, room.id);
      await this.roomService.deleteRoom(data.roomName);
      const message = "La room " + room.name + " a ete supprimee avec succes !";
      console.log(message);
      this.server.emit("RoomDeletionSuccess", message);
    }
    else
    {
      const message = "La room " + data.roomName + " n'existe pas.";
      console.log(message);
      this.server.emit("RoomDeletionError", message);
    }
}


  @UseGuards(ChatGuard)
  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(@MessageBody() data: { roomName: string }, @ConnectedSocket() client: Socket): Promise<void> 
  {
    const room = await this.roomService.getRoomByName(data.roomName);
    console.log(colors.BRIGHT + colors.GREEN + "L'utilisateur : ", colors.WHITE, client.data.user.username, colors.GREEN, " fait parti des rooms AVANT leave ", colors.WHITE, client.rooms);
    /*CAS OU LA ROOM EXISTE*/
    if (room) 
    {
      const user = await this.roomService.getSpecificMemberOfRoom(room.name, client.data.user.id); //pas sur de laisser l'id pour la fonction
      console.log(colors.BRIGHT + colors.YELLOW + " UTILISATEUR TROUVE DANS LEAVE === " + colors.WHITE, user, colors.RESET);
      if (user == undefined)
      {
        var message2 = "User " + client.data.user.username + " is not part of the room " + room.name + ". He therefore cannot leave it.";
        this.server.emit("userLeftRoomSuccess", message2);
        return ;
      }
        const membersFromRoom = await this.roomService.getAllMembersFromRoom(room.name);
        /* CAS OU L'UTILISATEUR EST LE DERNIER DANS LA ROOM */
        if ((await membersFromRoom).length === 1)
        {
          console.log(colors.BRIGHT + colors.RED + "J'ai lance handleDeleteRoom" + colors.RESET);
          await this.handleDeleteRoom(data, client);
        }
        /* CAS OU L'UTILISATEUR N'EST PAS LE DERNIER DANS LA ROOM */
        else
        {
          client.leave(room.name);
          await this.roomService.deleteUserFromRoominDb(room.name, client.data.user);
          const message = "User " + client.data.user.username + " left room " + room.name;
          this.server.emit("userLeftRoomSuccess", message);
          console.log(colors.BRIGHT + colors.GREEN + "L'utilisateur : ", colors.WHITE, client.data.user.username, colors.GREEN, " fait parti des rooms APRES leave ", colors.WHITE, client.rooms);
        }
    }
    /* CAS OU LA ROOM N'EXISTE PAS*/
    else
    {
      const message = "User " + client.data.user.username + " could not leave " + data.roomName + " because it does not exist.";
      this.server.emit("userLeftRoomError", message);
      console.log(message);
    }
  }

  /*=========================================================================================*/
  /*----------------------------------POUVOIRS DE L'OWNER------------------------------------*/
  /*=========================================================================================*/

  /*---------------------------------CHANGER LE MOT DE PASSE---------------------------------*/
  @UseGuards(ChatGuard)
  @SubscribeMessage('changePassword')
  async handleChangePassword(@MessageBody() data: { roomName: string, password: string },
  @ConnectedSocket() client: Socket): Promise<void> 
  {
    const room = await this.roomService.getRoomByName(data.roomName);
    const roomCreator = await this.roomService.getRoomCreator(data.roomName);
    if (room && roomCreator) 
    {
      console.log("Roome creator userneme === " + colors.FG_GREEN + roomCreator.username + colors.RESET);
      if (roomCreator.id == client.data.user.id)
      {
        if (await this.roomService.verifyPassword(data.password, room.password) === true)
          this.server.emit("changePasswordError", "Error, this is the same password.");
        else
        {
          room.password = await this.roomService.setPassword(data.password);
          await this.roomRepository.update(room.id, { password: room.password });
          this.server.emit("changePasswordSuccess", "Password for room " + data.roomName + " changed.");  
        }
      }
      else
        this.server.emit("changePasswordError", "Error, you are not the room owner.");
    }
    else
      this.server.emit("changePasswordError", "Password for room " + data.roomName + " could not be changed, because the room does not exist.");
  }

  /*-----------------------------------DESIGNER DES ADMINS-----------------------------------*/
  @UseGuards(ChatGuard)
  @SubscribeMessage('changePassword')
  async handlesetAdmin(@MessageBody() data: { roomName: string, adminName: string },
  @ConnectedSocket() client: Socket): Promise<void> 
  {
    const room = await this.roomService.getRoomByName(data.roomName);
    const roomCreator = await this.roomService.getRoomCreator(data.roomName);
    const newAdmin = await this.roomService.getSpecificMemberOfRoomByUsername(data.roomName, data.adminName);

    if (room && roomCreator && newAdmin) 
    {
      console.log("Roome creator userneme === " + colors.FG_GREEN + roomCreator.username + colors.RESET);
      if (roomCreator.id == client.data.user.id)
      {
          await this.roomService.setRoomAdministrator(room.name, newAdmin.id);
          this.server.emit("setAdminSuccess", newAdmin.username + "is a new admin in " + room.name);
      }
      else
        this.server.emit("setAdminError", "Error, you are not the room owner.");

    }
    else
      this.server.emit("setAdminError", "Error with set new administrator.");
  }
  /*=========================================================================================*/

}