import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './entities/message.entity';
import { MessagesRepository } from './entities/message.repository';
import { ChatService } from './chat.service';
import { ChatAuthService } from './chat-auth.service';
import { ChatGateway } from './chat.gateway';
import { UserModule } from 'src/user/user.module';


/*@Module({
    imports: [TypeOrmModule.forFeature([MessageEntity, MessagesRepository])],
    //controllers: [UserController],
    providers: [ChatService, ChatAuthService, ChatGateway],
    exports: [ChatService, ChatAuthService, ChatGateway],
  })
  export class ChatModule {}*/

  @Module({
    imports: [TypeOrmModule.forFeature([MessageEntity, MessagesRepository]), UserModule],
    providers: [ChatService, ChatAuthService, ChatGateway],
    exports: [ChatService, ChatAuthService, ChatGateway],
})
export class ChatModule {}