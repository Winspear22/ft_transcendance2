import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { lPaddle, rPaddle, ball, game } from "./objects";
import { UserService } from 'src/user/user.service';
import { UseGuards } from '@nestjs/common';
import { GameGuard } from './game-guard.guard';
import { GameService } from './game.service';
import { UserEntity } from 'src/user/user.entity';
import * as colors from '../colors'
import { gameI } from './game';
import { machine } from 'os';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchHistoryEntity } from './match-history.entity';
import { Not, Repository } from 'typeorm';
import { SocketConnectOpts } from 'net';
import { subscribe } from 'diagnostics_channel';
import { refCount } from 'rxjs';
import { match } from 'assert';

let ref_user: Map<number, UserEntity> = new Map();
let ref_client : Map<number, Socket> = new Map();
let waitingGames: Array<number> = new Array();
let gameMap: Map<number, game> = new Map();
let inGame: Map<string, number> = new Map();

let idx_games = 0;
 
@WebSocketGateway({cors: true, namespace: 'game'})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor (
    private userService: UserService,
    private readonly gameService: GameService,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(MatchHistoryEntity)
    private matchHistoryRepository: Repository<MatchHistoryEntity>
    ) {}
    @WebSocketServer()
    server: Server;
 
  @SubscribeMessage('disconnect')
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    // Déco in game
    if (inGame.get(socket.id) != undefined)
    {
      let gameI = gameMap.get(inGame.get(socket.id));
      inGame.delete(socket.id);
      gameI.status = "deco";
      if (socket.data.user.id == gameI.player1.idUser)
        gameI.player1.deco = 1;
      if (socket.data.user.id == gameI.player2.idUser)
        gameI.player2.deco = 1;
    }
    console.log("Disconnection detected: ", socket.id);
  }

  @SubscribeMessage('connection')   
  async handleConnection(@ConnectedSocket() socket: Socket) {
    // Gérez la connexion d'un joueur
    const user = await this.gameService.getUserFromSocket(socket); 
    if (user != undefined)
    { 
      ref_user.set(user.id, user);
      ref_client.set(user.id, socket);

      // changement de la socketId suite à un refresh dans la game map pour les game en waiting
      for (let value of gameMap.values()) {
        if (value.player1.idClient != ref_client.get(value.player1.idUser).id){
          value.player1.idClient = ref_client.get(value.player1.idUser).id;
        }
      }
      console.log(colors.BRIGHT + colors.GREEN, "User : " +  colors.WHITE + user.username + colors .GREEN +" just connected." + colors.RESET);
      console.log(colors.BRIGHT + colors.GREEN, "User id: " +  colors.WHITE + user.id + colors .GREEN +" User socket id : " + colors.WHITE + socket.id + colors.RESET);
      console.log(colors.BRIGHT + colors.GREEN, "User id: " +  colors.WHITE + user.id + colors .GREEN +" User socket id is in the handleConnection function: " + colors.WHITE + socket.id + colors.RESET);
      const gameHistory = await this.matchHistoryRepository.find({
        relations: {
          user: true,
        } 
        });
        if (gameHistory.length > 0) {
          for (let value of gameHistory.values()){
            if (user.username == value.user.username)
            {
              return;
            }
          }
        }
        this.gameService.createMatchHistory(user);
      } 
      else 
      {
        console.log(colors.BRIGHT + colors.RED, "Error. Socket id : " + colors.WHITE + socket.id + colors.RED + " could not connect." + colors.RESET);
        return this.handleDisconnect(socket);
      }
  } 

  @SubscribeMessage('updateUser') 
  async updateUserInSocket(@ConnectedSocket() socket: Socket, @MessageBody() name: string) {
    if (socket.data.user) {
      const user = await this.usersRepository.find({
        where: {
          username: name,
        }
      });
      if (user != undefined)
      { 
        ref_user.delete(socket.data.user.id);
        ref_client.delete(socket.data.user.id);
        ref_user.set(user[0].id, user[0]);
        ref_client.set(user[0].id, socket);
        socket.data.user = user[0];
      }
    }
  }

  startGame(game: game, server: Server): void {
    gameI(game, server);
  }

  @SubscribeMessage('searchGame')
  async search(@ConnectedSocket() socket: Socket) {
    if (socket.data.user) {
      for (let value of gameMap.values()) {
        if ((value.player1.idUser == socket.data.user.id || value.player2.idUser == socket.data.user.id) && value.status == "playing")
          return;
      }
      if (waitingGames.length >= 1)
      {
        if (socket.data.user.username == gameMap.get(waitingGames[0]).player1.username)
          return;
        let idx = waitingGames.shift();
        let gameI = gameMap.get(idx);
        gameI.player2.username = socket.data.user.username;
        gameI.player2.idClient = socket.id;
        gameI.player2.idUser = socket.data.user.id;
        const p1 = await this.usersRepository.find({
            where: {
              id: gameI.player1.idUser,
            }
          });
        const p2 = await this.usersRepository.find({
          where: {
            id: gameI.player2.idUser,
          }
        });
        let pl1 = p1[0];
        let pl2 = p2[0];
        pl1.user_status = "playing";
        pl2.user_status = "playing";
        await this.usersRepository.save(pl1);
        await this.usersRepository.save(pl2);
        gameI.status = "playing";
        this.server.to(gameI.player1.idClient).emit('goToGame'); //Envoyer la game aux 2 clients
        this.server.to(gameI.player2.idClient).emit('goToGame');
        this.server.to(gameI.player1.idClient).emit('theGame', {idx, gameI}); //Envoyer la game aux 2 clients
        this.server.to(gameI.player2.idClient).emit('theGame', {idx, gameI});
        this.startGame(gameMap.get(idx), this.server);
        inGame.set(gameI.player1.idClient, idx);
        inGame.set(gameI.player2.idClient, idx);
      }
      else 
      {
        let idx = idx_games += 1;
        let gameI = new game();
        gameI.player1.username = socket.data.user.username;
        gameI.player1.idClient = socket.id;
        gameI.player1.idUser = socket.data.user.id;
        gameI.status = "waiting";
        gameMap.set(idx, gameI);
        waitingGames.push(idx);
        this.server.to(socket.id).emit('w_idx', idx);
      }
    }
  } 

  @SubscribeMessage('stopSearchGame')
  async stopSearch(@ConnectedSocket() socket: Socket, @MessageBody() w_idx: number)
  {
    if (socket.data.user) {
      let idx = waitingGames.indexOf(w_idx);
      if (idx != -1) 
        waitingGames.splice(idx, 1);
      if (w_idx) 
      {
        if (gameMap.get(w_idx))
          gameMap.delete(w_idx);
      }
    }
  }

  @SubscribeMessage('invitPlayRequest')
  async gameInvitation(@ConnectedSocket() socket: Socket, @MessageBody() name: string) {
      if (socket.data.user && name) {
        if (name == socket.data.user.username)
          return;

        for (let value of gameMap.values()) {
          if ((value.player1.idUser == socket.data.user.id || value.player2.idUser == socket.data.user.id) && value.status == "playing") {
            return;
          }
        }
        const me = await this.usersRepository.find({
          where: {
            username: socket.data.user.username,
          }
        });
        const guest = await this.usersRepository.find({
          where: {
            username: name,
          }
        });
        
        // Name is blocked
        const blockedUser1 = me[0].blockedIds.find(block => block === guest[0].id);
        if (blockedUser1 !== undefined){
          this.server.to(socket.id).emit('invitPlayRequestError', "Error. Could not invit: " + name + " is blocked.");
          return;
        }
        // Name blocked Me
        const blockedUser2 = guest[0].blockedIds.find(block => block === me[0].id);
        if (blockedUser2 !== undefined) {
          this.server.to(socket.id).emit('invitPlayRequestError', "Error. Could not invit: " + name + " block you.");
          return;
        }

        if (guest.length > 0) { 
          // Offline
          if (guest[0].user_status == "Offline")
          {
            for(let value of gameMap.values()) {
              if(value.player2.username == guest[0].username && value.status == "waiting") {
                gameMap.delete(value.id);
              }
            }
            this.server.to(socket.id).emit('invitPlayRequestError', name + " is offline.");
            return;
          }
          //Deja invité
          for (let value of gameMap.values()) {
            if (value.player1.idUser == socket.data.user.id && value.player2.username == name && value.status == "waiting")
            {
              const idx = value.id;
              this.server.to(ref_client.get(guest[0].id).id).emit("invitPlayRequestSuccess", "Invitation to play from " + socket.data.user.username);
              this.server.to(ref_client.get(guest[0].id).id).emit("invit_idx_game", idx);
              this.server.to(socket.id).emit('invitPlayRequestSuccess', "Your invitation has been sent to " + name);
              return;
            }
          }
          for (let value of gameMap.values()) {
            if ((value.player1.idUser == guest[0].id || value.player2.idUser == guest[0].id) &&  value.status == "playing")
              this.server.to(socket.id).emit('invitPlayRequestError', "Error. Could not invit " + name + " is playing");
          }
          // Création de la partie
          if (guest[0].user_status == "Online") {
            let idx = idx_games += 1;
            let gameI = new game();
            gameI.id = idx;
            gameI.player1.username = socket.data.user.username;
            gameI.player2.username = name;
            gameI.player1.idClient = socket.id;
            gameI.player1.idUser = socket.data.user.id;
            gameI.player2.idUser = guest[0].id;
            gameI.status = "waiting";
            gameMap.set(idx, gameI);
            this.server.to(ref_client.get(guest[0].id).id).emit("invitPlayRequestSuccess", "Invitation to play from " + socket.data.user.username);
            this.server.to(ref_client.get(guest[0].id).id).emit("invit_idx_game", idx);
            this.server.to(socket.id).emit('invitPlayRequestSuccess', "Your invitation has been sent to " + name);
            return;
          }
        }
        else
          this.server.to(socket.id).emit('invitPlayRequestError', "Error. Could not invit " + name);
      }
    }

    @SubscribeMessage('acceptInvitToPlayRequest')
    async acceptGameInvitation(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    if (socket.data.user) {
      const me = await this.usersRepository.find({
        where: {
          username: socket.data.user.id,
        }
      });
      for (let value of gameMap.values()) {
        if ((value.player1.idUser == socket.data.user.id || value.player2.idUser == socket.data.user.id) && value.status == "playing")
          return; 
      }

      for (let value of gameMap.values()) {
        if (value.player2.idUser == socket.data.user.id && value.id != data.idx && value.status == "waiting")
        {
          let id = value.id;
          gameMap.delete(id);
        }
      }

      for (let value of gameMap.values()) {

        if (value.player2.idUser == socket.data.user.id && value.id == data.idx && value.status == "waiting"){
          if (inGame.get(value.player1.idClient) != undefined)
            return;
          let idx = value.id;
          value.player2.idClient = socket.id;
          const p1 = await this.usersRepository.find({
            where: {
              id: value.player1.idUser,
            }
          });
          const p2 = await this.usersRepository.find({
            where: { 
              id: value.player2.idUser,
            }
          });
          let pl1 = p1[0];
          let pl2 = p2[0];
          pl1.user_status = "playing";
          pl2.user_status = "playing";
          await this.usersRepository.save(pl1);
          await this.usersRepository.save(pl2);
          value.status = "playing";
          this.server.to(value.player1.idClient).emit('goToGame');
          this.server.to(value.player2.idClient).emit('goToGame');
          this.server.to(value.player1.idClient).emit('theGame', {idx, value}); //Envoyer la game aux 2 clients
          this.server.to(value.player2.idClient).emit('theGame', {idx, value});
          this.startGame(gameMap.get(idx), this.server);
          inGame.set(value.player1.idClient, idx);
          inGame.set(value.player2.idClient, idx);
        }
      }
    }
  }

  @SubscribeMessage('declineInvitToPlayRequest')
  async declineGameInvitation(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    if (socket.data.user) {
      for (let value of gameMap.values()) {
        if (value.player2.idUser == socket.data.user.id && value.id == data.idx && value.status == "waiting"){
          let idx = value.id;
          gameMap.delete(idx);
        }
      }
    }
  }

  @SubscribeMessage('gameEnd')
  async endMatch(@ConnectedSocket() socket: Socket, @MessageBody() idx: number) {
    if (socket.data.user) {
      const gameI = gameMap.get(inGame.get(socket.id));
      if(gameI && (gameI.player1.idClient == socket.id || gameI.player1.deco == 1))
      {
        const p1 = await this.usersRepository.find({
          where: {
            id: gameI.player1.idUser,
          }
        });
        const p2 = await this.usersRepository.find({
          where: {
            id: gameI.player2.idUser,
          }
        }); 
        p1[0].user_status = "Online";
        p2[0].user_status = "Online";
        await this.usersRepository.save(p1);
        await this.usersRepository.save(p2);
        this.gameService.createMatch(gameI, ref_client);
        let idP2 = gameI.player2.idClient;
        gameMap.delete(inGame.get(socket.id));
        inGame.delete(socket.id);
        inGame.delete(idP2);
      }
      const matchHistory = socket.data.user.matchHistory;
      this.server.to(socket.id).emit('matchHistory', matchHistory);
    }
  }

  @SubscribeMessage('press') 
  async handlePress(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    if (socket.data.user) {
      const gameI = gameMap.get(data.idx); 
        if (gameI && socket.id == gameI.player1.idClient)
        {
          // w key
          if (data.key == 90 || data.key == 87 || data.key == 38) {
            gameI.player1.move = 1;
          }
          // a key
          else if (data.key == 83 || data.key == 40) {
            gameI.player1.move = -1;
          }
        }
        else if (gameI && socket.id == gameI.player2.idClient)
        {
          // w key
          if (data.key == 90 || data.key == 87 || data.key == 38) {
            gameI.player2.move = 1;
          }
          // a key
          else if (data.key == 83 || data.key == 40) {
            gameI.player2.move = -1;
          }
      }
    }
  }

  @SubscribeMessage('release')
  async handleRelease(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    if (socket.data.user) {
      const gameI = gameMap.get(data.idx);
        if (gameI && socket.id == gameI.player1.idClient)
        {
          if (data.key == 90 || data.key == 83 || data.key == 87 || data.key == 38 || data.key == 40) {
              gameI.player1.move = 0;
          }
        }
        else if (gameI && socket.id == gameI.player2.idClient)
        {
          if (data.key == 90 || data.key == 83 || data.key == 87 || data.key == 38 || data.key == 40) {
            gameI.player2.move = 0;
          }
        }
      }
  }

  @SubscribeMessage('matchHistory')
  async sendMatchHistory(@ConnectedSocket() socket: Socket) {
    
    if (socket.data.user)
    {
      const matchHistory = socket.data.user.matchHistory;
      this.server.to(socket.id).emit('matchHistory', matchHistory);
    }
  }

  @SubscribeMessage('onlineUsers')  
  async sendOnlineUsers(@ConnectedSocket() socket: Socket) {
      const user = await this.gameService.getUserFromSocket(socket);
      let me = await this.usersRepository.find({
        relations: {
          friends: true,
        },
        where: {
          id: socket.data.user.id,
        }
      });

      let allOnlineUsers = await this.usersRepository.find({
        relations: {
          friends: false,
        },
        where: {
          id: Not(socket.data.user.id),
          user_status: "Online",
        }
      });
      let onlineUsersWithoutFriends: UserEntity [] = new Array();
      let i = 0;
      let j = me[0].friends.length;
      if (j == 0) {
        this.server.to(socket.id).emit('onlineUsers', allOnlineUsers);
        return;
      }
      for (let value1 of allOnlineUsers.values()) {
        i = 0;
        for (let value2 of me[0].friends.values()) {
          i++;
          if (value1.id == value2.friendId)
            break;
          if (j != 0 && i == j) {
            onlineUsersWithoutFriends.push(value1);
          }
        }
      if (onlineUsersWithoutFriends.length)
        this.server.to(socket.id).emit('onlineUsers', onlineUsersWithoutFriends);
    }
  }

  @SubscribeMessage('friendProfile')
  async sendFriendProfile(@ConnectedSocket() socket: Socket, @MessageBody() name: string)
  {
    if (socket.data.user) {
      const friend = await this.usersRepository.find({
        relations: {
          friends: true,
        },
        where: {
          username: name,
        }
      });
      if (friend != undefined)
        this.server.to(socket.id).emit('friendProfile', friend);
    }
  }
}