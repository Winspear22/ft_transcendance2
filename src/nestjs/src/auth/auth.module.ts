import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EventGateway } from './websocket.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { IntraStrategy } from './strategies/ft.strategy'
import { BlacklistedToken } from 'src/chat/entities/blacklisted-token.entity';
import { MessageEntity } from 'src/chat/entities/message.entity';
import { ChatModule } from 'src/chat/chat.module';
import { RoomEntity } from 'src/chat/entities/room.entity';
import { RoomEntity2 } from 'src/chat/entities/room2.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { Friend } from 'src/user/entities/friend.entity';
import { FriendChat } from 'src/user/entities/friendchat.entity';
import { FriendMessage } from 'src/user/entities/friendmessage.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'postgresql',
      port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [UserEntity, BlacklistedToken,
      MessageEntity, RoomEntity, RoomEntity2, Friend, FriendChat, FriendMessage],  // Ajoutez BlacklistedTokenEntity ici
      synchronize: true,
    }), // Verifier à quoi sert ce module.
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'vuejs', 'uploads'), // remontez deux dossiers en arrière
      serveRoot: '/public/',  // le préfixe pour accéder aux fichiers
    }),
    UserModule,
    HttpModule,
    ChatModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, EventGateway, IntraStrategy],
})
export class AuthModule {}

