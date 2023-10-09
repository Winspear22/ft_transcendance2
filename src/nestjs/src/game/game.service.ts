import { Injectable } from '@nestjs/common';
import { GameAuthService } from './game-auth.service';
import { UserService } from 'src/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { DataSource, Repository } from 'typeorm';
import { ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import * as colors from '../colors'
import { MatchHistoryEntity } from './match-history.entity';
import { MatchEntity } from './match.entity';
import { game } from './objects';


@Injectable()
export class GameService { 
    constructor (
        private gameAuthService: GameAuthService,
        private userService: UserService,
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
        @InjectRepository(MatchHistoryEntity)
        private matchHistoryRepository: Repository<MatchHistoryEntity>,
        @InjectRepository(MatchEntity)
        private matchRepository: Repository<MatchEntity>,
    ) {}

    async findUserById(id: number): Promise<UserEntity> {
        return await this.usersRepository.findOneBy({ id });
      }

    async createMatchHistory(user: UserEntity) {
        const matchHistory = this.matchHistoryRepository.create({
            total_parties: 0,
            total_victoire: 0,
            total_défaite: 0,
            winrate: 0,
            user: user
        })
        user.matchHistory = matchHistory;
        await this.matchHistoryRepository.save(matchHistory);
        await this.usersRepository.save(user);
    }

    async createMatch(game: game, refs_client: Map<number, Socket>) {
        const match = this.matchRepository.create({
            player1: game.player1.username,
            player2: game.player2.username,
            player1_points: game.player1.points,
            player2_points: game.player2.points
        })
        await this.matchRepository.save(match);
        //Cherche le match history des deux joueurs
        let matchHistoryArray = await this.matchHistoryRepository.find({
            relations: {
              user: true,
            }
          });
          for (let matchHistory of matchHistoryArray.values()){
                if (game.player1.idUser == matchHistory.user.id || game.player2.idUser == matchHistory.user.id)
                {
                    matchHistory.total_parties += 1;
                    if (game.player1.idUser == matchHistory.user.id)
                    {
                        if (game.player1.winner == true)
                            matchHistory.total_victoire += 1;
                        else
                            matchHistory.total_défaite += 1;
                    }
                    if (game.player2.idUser == matchHistory.user.id)
                    {
                        if (game.player2.winner == true)
                            matchHistory.total_victoire += 1;
                        else
                            matchHistory.total_défaite += 1;
                    }
                    matchHistory.winrate = (matchHistory.total_victoire / matchHistory.total_parties) * 100;
                    matchHistory.winrate = Math.round(matchHistory.winrate);
                    matchHistory.matches.push(match);
                    await this.matchHistoryRepository.save(matchHistory);
                    if (game.player1.idUser == matchHistory.user.id)
                    {
                        refs_client.get(game.player1.idUser).data.user.matchHistory = matchHistory;
                    }
                    if (game.player2.idUser == matchHistory.user.id)
                    {
                        refs_client.get(game.player2.idUser).data.user.matchHistory = matchHistory;
                    }
                }
            }
    }

    async getUserFromSocket(@ConnectedSocket() client: Socket): Promise<UserEntity | undefined>
    {
        let accessTokenCookie = client.handshake.query.Cookie;
        console.log("User connected : ", colors.WHITE, client.id, " connection status : ", colors.GREEN, client.connected, colors.RESET);
        if (!accessTokenCookie) 
        {
            console.log('Access Token Cookie is missing.');
            return undefined;
        }

        if (Array.isArray(accessTokenCookie)) {
            accessTokenCookie = accessTokenCookie[0];
        }
   
        const userData = this.gameAuthService.extractAccessTokenFromCookie(accessTokenCookie);
        if (!userData){
            console.log("extractAccessTokenFromCookie");
            return undefined;
        }
        const { username, refreshToken, accessToken } = userData;
    
        /*if (await this.gameAuthService.isTokenBlacklisted(accessToken)) {
            console.log('Token is blacklisted.');
            return undefined;
        }*/
   
        const decodedPayload = this.gameAuthService.decodeAccessToken(accessToken);
        if (!decodedPayload) {
            console.log('Token is invalid or malformed.');
            return undefined;
        }
    
        if (this.gameAuthService.hasTokenExpired(decodedPayload.exp)) {
            console.log('Token has expired.');
            return undefined;
        }
    
        const payload = await this.gameAuthService.verifyToken(accessToken, process.env.ACCESS_TOKEN);
        if (!payload) {
            console.log("verifyToken");
            return undefined;
        }

   
        // const user = await this.userService.findUserByUsername(username);
        const user = await this.findUserById(parseInt(decodedPayload.sub));
        client.data.user = user;
    
        if (user)
            return (user);
        else
            return undefined;
    }
}
