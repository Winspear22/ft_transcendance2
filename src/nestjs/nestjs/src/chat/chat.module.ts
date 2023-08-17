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

  @Module({
    imports: [TypeOrmModule.forFeature([MessageEntity, MessagesRepository, RoomEntity, RoomsRepository]), UserModule],
    providers: [ChatService, ChatAuthService, ChatGateway, RoomService],
    exports: [ChatService, ChatAuthService, ChatGateway, RoomService],
})
export class ChatModule {}