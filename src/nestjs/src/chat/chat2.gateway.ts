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
import { UseGuards } from '@nestjs/common';
import { ChatGuard } from './guard/chat-guard.guard';
import { RoomEntity2 } from './entities/room2.entity';
import { RoomDto, RoomFromFrontDto } from './dto/room2.dto';
import { RoomService2 } from './room2.service';
  
  
  @WebSocketGateway({cors: true, namespace: 'newtest'})
  export class ChatGateway2 
  {
    constructor(private userService: UserService,
      private readonly chatService: ChatService,
      private readonly chatAuthService: ChatAuthService,
      private readonly room2Service: RoomService2
      ) {}
    
    private ref_client = new Map<string, number>()
  
  
    @WebSocketServer()
    server: Server;
      
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
      client.data.user = user;
      this.ref_client.set(client.id, user.id);
      console.log(colors.BRIGHT + colors.GREEN, "User id: " +  colors.WHITE + user.id + colors .GREEN +" User socket id : " + colors.WHITE + client.id + colors.RESET);
      console.log(colors.BRIGHT + colors.GREEN, "User id: " +  colors.WHITE + user.id + colors .GREEN +" User socket id is in the handleConnection function: " + colors.WHITE + client.id + colors.RESET);
  
    }
  
    handleDisconnect(client: Socket)
    {
      client.disconnect();
      console.log("User connected : ", colors.WHITE, client.id, " connection status : ", colors.FG_RED, client.connected, colors.RESET);
    }

    /*@UseGuards(UserAuthHandshake)
    @SubscribeMessage('createChannel')
    async onCreateChannel(client: Socket, channel: ChannelI): Promise<boolean> {
        const createChannel: ChannelI = await this.channelService.createChannel(channel, client.data.user);
        if (!createChannel) {
            return false;
        } else {
            await this.emitChannelForConnectedUsers();
            return true;
        }
    }*/

    @UseGuards(ChatGuard)
    @SubscribeMessage('createRoom')
    async handleCreateRoom(@ConnectedSocket() client: Socket, @MessageBody() data: RoomFromFrontDto)
    {
      const room = await this.room2Service.getRoomByName(data.roomName);
      console.log("Je suis ici");
      if (room == undefined)
      {
        //console.log(data.roomName);
        //console.log(data.password);
        //console.log(data.publicRoom);
        const roomCreated = await this.room2Service.createRoom(client.data.user, data);
        if (!roomCreated)
        {
          this.server.emit("RoomCreationError", "La room " + data.roomName + " n'a pas ete creee");
          return false;
        }
        //await this.room2Service.getRoomByName(roomCreated.name);
        this.server.emit("RoomCreationSuccess", "La room " + roomCreated.name + " a ete creee.");
        return roomCreated;
      }
      else
      {
        this.server.emit("RoomCreationError", "La room " + data.roomName + " existe deja, par consequent elle n'a pas ete creee");
        return null;
      }
    }
}