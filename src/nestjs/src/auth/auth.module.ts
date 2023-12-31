import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { IntraStrategy } from './strategies/ft.strategy'
import { MessageEntity } from 'src/chat/entities/message.entity';
import { ChatModule } from 'src/chat/chat.module';
import { RoomEntity } from 'src/chat/entities/room.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { Friend } from 'src/user/entities/friend.entity';
import { FriendChat } from 'src/user/entities/friendchat.entity';
import { FriendMessage } from 'src/user/entities/friendmessage.entity';
import { MatchHistoryEntity } from 'src/game/match-history.entity';
import { MatchEntity } from 'src/game/match.entity';
import { GameModule } from 'src/game/game.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'postgresql',
      port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [UserEntity,
      MessageEntity, RoomEntity, Friend, FriendChat, FriendMessage, MatchHistoryEntity, MatchEntity],  // Ajoutez BlacklistedTokenEntity ici
      synchronize: true,
    }), // Verifier à quoi sert ce module.
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'vuejs', 'uploads'), // remontez deux dossiers en arrière
      serveRoot: '/public/',  // le préfixe pour accéder aux fichiers
    }),
    UserModule,
    HttpModule,
    ChatModule,
    GameModule
  ],
  controllers: [AuthController],
  providers: [AuthService, IntraStrategy],
})
export class AuthModule {}

