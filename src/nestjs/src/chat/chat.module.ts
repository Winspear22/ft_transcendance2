import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './entities/message.entity';
import { MessagesRepository } from './entities/message.repository';
import { ChatService } from './chat.service';
import { ChatAuthService } from './chat-auth.service';
import { ChatGateway } from './chat.gateway';
import { UserModule } from 'src/user/user.module';
import { RoomEntity } from './entities/room.entity';
import { RoomsRepository } from './entities/room.repository';
import { RoomService } from './room.service';
import { RoomEntity2 } from './entities/room2.entity';
import { RoomsRepository2 } from './entities/room2.repository';
import { RoomService2 } from './room2.service';
import { ChatGateway2 } from './chat2.gateway';

  @Module({
    imports: [TypeOrmModule.forFeature([MessageEntity, MessagesRepository,
      RoomEntity, RoomsRepository, RoomEntity2, RoomsRepository2]), UserModule],
    providers: [ChatService, ChatAuthService, ChatGateway, ChatGateway2, RoomService, RoomService2],
    exports: [ChatService, ChatAuthService, ChatGateway, ChatGateway2, RoomService, RoomService2],
})
export class ChatModule {}