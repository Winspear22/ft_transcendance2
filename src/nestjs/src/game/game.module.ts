import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { UserModule } from 'src/user/user.module';
import { GameAuthService } from './game-auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchHistoryEntity } from './match-history.entity';
import { MatchHistoryRepository } from './match-history.repository';
import { MatchEntity } from './match.entity';
import { MatchRepository } from './match.repository';

@Module({
    providers: [GameService, GameGateway, GameAuthService],
    controllers: [GameController],
    imports: [
        UserModule, 
        TypeOrmModule.forFeature([MatchHistoryEntity, MatchHistoryRepository, MatchEntity, MatchRepository])
    ],
    exports: [GameGateway]
})
export class GameModule {}