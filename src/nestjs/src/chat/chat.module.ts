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
import { Friend } from 'src/user/entities/friend.entity';
import { FriendsRepository } from 'src/user/entities/friend.repository';
import { FriendChat } from 'src/user/entities/friendchat.entity';
import { FriendChatsRepository } from 'src/user/entities/friendchat.repository';
import { FriendMessage } from 'src/user/entities/friendmessage.entity';
import { DMGateway } from './dm.gateway';
import { DMService } from './dm.service';

  @Module({
    imports: [TypeOrmModule.forFeature([MessageEntity, MessagesRepository,
      RoomEntity, RoomsRepository, Friend, FriendsRepository,
      FriendChat, FriendChatsRepository, FriendMessage, FriendsRepository]), UserModule],
    providers: [ChatService, ChatAuthService, ChatGateway, RoomService, DMGateway, DMService],
    exports: [ChatService, ChatAuthService, ChatGateway, RoomService, DMGateway, DMService],
})
export class ChatModule {}