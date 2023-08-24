import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
import { ChatGateway2 } from './chat/chat2.gateway';

@Module({
  controllers: [AppController],
  providers: [AppService, ChatGateway, ChatGateway2]
})
export class AppModule {}
