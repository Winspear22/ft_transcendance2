import { 
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { UserService } from 'src/user/user.service';
import * as colors from '../colors';
import { ChatService } from './chat.service';
import { ChatAuthService } from './chat-auth.service';
import { CreateMessageDto } from './dto/message.dto';
import { RoomService } from './room.service';
import { RoomEntity } from './entities/room.entity';
import { UseGuards } from '@nestjs/common';
import { ChatGuard } from './guard/chat-guard.guard';


@WebSocketGateway({cors: true, namespace: 'chats'})
export class ChatGateway 
{
  constructor(private userService: UserService,
    private readonly chatService: ChatService,
    private readonly chatAuthService: ChatAuthService,
    private readonly roomService: RoomService
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
      const room = await this.roomService.createRoom(data, client.data.user, [client.data.user]);
      client.join(room.name);
      console.log(colors.BRIGHT + colors.BLUE + "L'utilisateur : ", colors.WHITE, client.data.user.username, colors.BLUE, " fait parti des rooms APRES JOIN", colors.WHITE, client.rooms);
      console.log(colors.BRIGHT + colors.BLUE + "La room : ", colors.WHITE, data.roomName, colors.BLUE, " a ete creee avec succes." + colors.RESET);
      await this.roomService.addUserToRoom(room.name, client.data.user);
      const errorMessage = "La room " + room.name + " a ete creee avec succes !";
      //await this.chatService.setUserAdminStatusON(client, room.id);
      //await this.chatService.setUserCreatorStatusON(client, room.id);
      this.server.emit("RoomCreationSuccess", errorMessage);
      return room;
    }
    else
    {
      console.log(colors.BRIGHT + colors.BLUE + "La room : ", colors.WHITE, data.roomName, colors.BLUE, " n'a pas pu etre creee car elle existe deja." + colors.RESET)
      const errorMessage = "La room " + roomName.name + " existe deja, par consequent elle n'a pas ete creee";
      this.server.emit("RoomCreationError", errorMessage);
      return roomName;
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
      await this.roomService.deleteUserFromRoom(data.roomName, client.data.user);
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


  /* NE FONCTIONNE PAS DU TOUT */
  @UseGuards(ChatGuard)
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@MessageBody() data: { roomName: string, password: string },
  @ConnectedSocket() client: Socket): Promise<void> 
  {
    const room = await this.roomService.getRoomByName(data.roomName); // Supposant que vous avez une méthode getRoomById
    if (room) 
    {
      if (room.password != null && await this.roomService.verifyPassword(data.password, room.password) === true)
      {
        const user = await this.roomService.getSpecificMemberOfRoom(room.name, client.data.user.id); //pas sur de laisser l'id pour la fonction
        console.log(colors.BRIGHT + colors.MAGENTA + " UTILISATEUR TROUVE DANS JOIN === " + colors.WHITE, user, colors.RESET);
        if (user != undefined)
        {
          var message2 = "User " + client.data.user.username + " is already part of the room " + room.name + ".";
          this.server.emit("userJoinedRoomSuccess", message2);
          return ;
        }
        console.log(colors.BRIGHT + colors.BLUE + "L'utilisateur : ", colors.WHITE, client.data.user.username, colors.BLUE, " fait parti des rooms AVANT JOIN", colors.WHITE, client.rooms);
        client.join(room.name);
        await this.roomService.addUserToRoom(room.name, client.data.user);
        const message = "User " + client.data.user.username + " joined room " + room.name + " successfully.";
        this.server.emit("userJoinedRoomSuccess", message);
        console.log(colors.BRIGHT + colors.BLUE + "L'utilisateur : ", colors.WHITE, client.data.user.username, colors.BLUE, " fait parti des rooms APRES JOIN ", colors.WHITE, client.rooms);
      }
      else if (room.password == null)
      {
        const user = await this.roomService.getSpecificMemberOfRoom(room.name, client.data.user.id); //pas sur de laisser l'id pour la fonction
        console.log(colors.BRIGHT + colors.MAGENTA + " UTILISATEUR TROUVE DANS JOIN === " + colors.WHITE, user, colors.RESET);
        if (user != undefined)
        {
          var message2 = "User " + client.data.user.username + " is already part of the room " + room.name + ".";
          this.server.emit("userJoinedRoomSuccess", message2);
          return ;
        }
        console.log(colors.BRIGHT + colors.BLUE + "L'utilisateur : ", colors.WHITE, client.data.user.username, colors.BLUE, " fait parti des rooms AVANT JOIN", colors.WHITE, client.rooms);
        client.join(room.name);
        await this.roomService.addUserToRoom(room.name, client.data.user);
        const message = "User " + client.data.user.username + " joined room " + room.name + " successfully.";
        this.server.emit("userJoinedRoomSuccess", message);
        console.log(colors.BRIGHT + colors.BLUE + "L'utilisateur : ", colors.WHITE, client.data.user.username, colors.BLUE, " fait parti des rooms APRES JOIN ", colors.WHITE, client.rooms);

      }
      else
      {
        this.server.emit("userJoinedWrongPassword", "Error, wrong password.");
      }
    }
    else
    {
      const message = "User " + client.data.user.username + "did not join room " + data.roomName + " because it does not exist.";
      this.server.emit("userJoinedRoomError", message);
      console.log(message);
    }
  }

  



  /*@UseGuards(ChatGuard)
  @SubscribeMessage('newMessageInRoom')
  async handleNewMessageRoom(@MessageBody() data: CreateMessageDto, @ConnectedSocket() client: Socket): Promise<void> {
    const newMessage = await this.chatService.createMessage(data);
    //console.log(data);
    //this.server.to(data.room.name).emit('newMessageInRoom', newMessage); // Émet le message à une salle spécifique
  }
  @UseGuards(ChatGuard)
  @SubscribeMessage('who')
  async whoisinroom(@MessageBody() data: { roomId: number }, @ConnectedSocket() client: Socket) 
  {
    const room = await this.roomService.getAllMembersFromRoom(data.roomId);
    console.log(room);
  }*/


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
          await this.roomService.deleteUserFromRoom(room.name, client.data.user);
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
}