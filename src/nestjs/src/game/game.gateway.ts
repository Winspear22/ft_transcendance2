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
import { Repository } from 'typeorm';
import { SocketConnectOpts } from 'net';

let ref_user: Map<number, UserEntity> = new Map(); // A retirer
let ref_client : Map<string, Socket> = new Map();
let waitingGames: Array<number> = new Array();
let gameMap: Map<number, game> = new Map();
let inGame: Map<string, number> = new Map();

let idx_games = 0;

@WebSocketGateway({cors: true, namespace: 'game'})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
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
    const user = await this.gameService.getUserFromSocket(socket);
    // Gérez la déconnexion d'un joueur
    console.log('Disconnection detected: ', user.username);
    // Si déco ig
    if (inGame.get(socket.id) != undefined)
    {
      let gameI = gameMap.get(inGame.get(socket.id));
      inGame.delete(socket.id);
      gameI.status = "deco";
      if (user.username == gameI.player1.username)
        gameI.player1.deco = 1;
      if (user.username == gameI.player2.username)
        gameI.player2.deco = 1;
    }
  }

  @SubscribeMessage('connection')
  async handleConnection(@ConnectedSocket() socket: Socket) {
    // Gérez la connexion d'un joueur
    const user = await this.gameService.getUserFromSocket(socket);
    if (user != undefined)
    {
      ref_user.set(user.id, user);
      ref_client.set(user.username, socket);
      console.log(colors.BRIGHT + colors.GREEN, "User : " +  colors.WHITE + user.username + colors .GREEN +" just connected." + colors.RESET);
      console.log(colors.BRIGHT + colors.GREEN, "User id: " +  colors.WHITE + user.id + colors .GREEN +" User socket id : " + colors.WHITE + socket.id + colors.RESET);
      console.log(colors.BRIGHT + colors.GREEN, "User id: " +  colors.WHITE + user.id + colors .GREEN +" User socket id is in the handleConnection function: " + colors.WHITE + socket.id + colors.RESET);
      const gameHistory = await this.matchHistoryRepository.find({
        relations: {
          user: true,
        }
        }); 
        for (let value of gameHistory.values()){
          if (user.username == value.user.username)
          {
            return;
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

  startGame(game: game, server: Server): void {
    gameI(game, server);
  }

  @SubscribeMessage('searchGame')
  async search(@ConnectedSocket() socket: Socket) {
    const user = await this.gameService.getUserFromSocket(socket);
    for (let value of gameMap.values()) {
      if ((value.player1.username == user.username || value.player2.username == user.username) && value.status == "playing")
        return;
    }
    if (waitingGames.length >= 1)
    { 
      if (user.username == gameMap.get(waitingGames[0]).player1.username)
        return;
      let idx = waitingGames.shift();
      let gameI = gameMap.get(idx);
      gameI.player2.username = user.username;
      gameI.player2.idClient = socket.id;
      gameI.status = "playing";
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
      gameI.player1.username = user.username;
      gameI.player1.idClient = socket.id;
      gameI.status = "waiting";
      gameMap.set(idx, gameI);
      waitingGames.push(idx);
      this.server.to(socket.id).emit('w_idx', idx);
    } 
  } 

  @SubscribeMessage('stopSearchGame')
  async stopSearch(@ConnectedSocket() socket: Socket, @MessageBody() w_idx: number)
  {
    let idx = waitingGames.indexOf(w_idx);
    if (idx != -1) 
      waitingGames.splice(idx, 1);
    if (w_idx) 
    {
      if (gameMap.get(w_idx))
        gameMap.delete(w_idx);
    }
  }

  @SubscribeMessage('invitPlayRequest')
  async gameInvitation(
    @ConnectedSocket() socket: Socket, 
    @MessageBody() name: string
    ){
      const user = await this.gameService.getUserFromSocket(socket);
      if (name == user.username)
        return;
      for (let value of gameMap.values()) {
        if (value.player1.username == user.username && value.player2.username == name && value.status == "waiting")
        {
          //Deja invité
          this.server.to(ref_client.get(name).id).emit("invitPlayRequestSuccess", "Invitation to play from " + user.username);
          this.server.to(socket.id).emit('invitPlayRequestSuccess', "Your invitation has been sent to " + name);
          return;
        }
      }
      for (let value of ref_user.values()) {
        if (value.username == name) {
          let idx = idx_games += 1;
          let gameI = new game();
          gameI.id = idx;
          gameI.player1.username = user.username;
          gameI.player2.username = name;
          gameI.player1.idClient = socket.id;
          gameI.status = "waiting";
          gameMap.set(idx, gameI);
          this.server.to(ref_client.get(name).id).emit("invitPlayRequestSuccess", "Invitation to play from " + user.username);
          this.server.to(socket.id).emit('invitPlayRequestSuccess', "Your invitation has been sent to " + name);
          return;
          }
        }
      this.server.to(socket.id).emit('invitPlayRequestError', "Error. Could not invit " + name)
    }
  
  @SubscribeMessage('acceptInvitToPlayRequest')
  async acceptGameInvitation(@ConnectedSocket() socket: Socket) {
    const user = await this.gameService.getUserFromSocket(socket);
    for (let value of gameMap.values()) {
      if (value.player2.username == user.username && value.status == "waiting"){
        if (inGame.get(value.player1.idClient) != undefined)
          return;
        let idx = value.id;
        value.player2.idClient = socket.id;
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

  @SubscribeMessage('declineInvitToPlayRequest')
  async declineGameInvitation(@ConnectedSocket() socket: Socket) {
    const user = await this.gameService.getUserFromSocket(socket);
    for (let value of gameMap.values()) {
      if (value.player2.username == user.username && value.status == "waiting"){
        let idx = value.id;
        gameMap.delete(idx);
      }
    }
  }

  @SubscribeMessage('gameEnd')
  async endMatch(@ConnectedSocket() socket: Socket, @MessageBody() idx: number) {
    // A tester et ajouter les Many One To One Many Many One
    const user = await this.gameService.getUserFromSocket(socket);
    const gameI = gameMap.get(inGame.get(socket.id));
    if (gameI && gameI.player1.idClient == socket.id)
    {
      this.gameService.createMatch(gameI);
      let idP2 = gameI.player2.idClient;
      gameMap.delete(inGame.get(socket.id));
      inGame.delete(socket.id);
      inGame.delete(idP2);
    }
    const matchHistory = user.matchHistory;
    this.server.to(socket.id).emit('matchHistory', matchHistory);
  }

  @SubscribeMessage('press')
  async handlePress(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {


    const gameI = gameMap.get(data.idx); 
      if ( socket.id == gameI.player1.idClient)
      {
        // w key
        if (data.key == 90) {
          gameI.player1.move = 1;
        }
        // a key
        else if (data.key == 83) {
          gameI.player1.move = -1;
        }
      }
      else if (socket.id == gameMap.get(data.idx).player2.idClient)
      {
        // w key
        if (data.key == 90) {
          gameI.player2.move = 1;
        }
        // a key
        else if (data.key == 83) {
          gameI.player2.move = -1;
        }
    }
  }

  @SubscribeMessage('release')
  async handleRelease(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    
    const gameI = gameMap.get(data.idx);
      if ( socket.id == gameMap.get(data.idx).player1.idClient)
      {
        if (data.key == 90 || data.key == 83) {
            gameI.player1.move = 0;
        }
      }
      else if (socket.id == gameMap.get(data.idx).player2.idClient)
      {
        if (data.key == 90 || data.key == 83) {
          gameI.player2.move = 0;
        }
      }
  }

  @SubscribeMessage('matchHistory')
  async sendMatchHistory(@ConnectedSocket() socket: Socket) {
    const user = await this.gameService.getUserFromSocket(socket);
    if (user != undefined)
    {
      const matchHistory = user.matchHistory;
      this.server.to(socket.id).emit('matchHistory', matchHistory);
    }
  }

  @SubscribeMessage('onlineUsers')
  async sendOnlineUsers(@ConnectedSocket() socket: Socket, @MessageBody() name: string) {
    let onlineUsers = await this.usersRepository.find({
      relations: {
        friends: true,
      },
      where: {
        user_status: "Online",
      }
    });
    this.server.to(socket.id).emit('onlineUsers', onlineUsers);
  }
}
