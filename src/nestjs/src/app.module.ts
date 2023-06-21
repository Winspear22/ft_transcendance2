import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventGateway } from './websocket.gateway'; // Assurez-vous que ce chemin est correct

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, EventGateway], // Ajoutez votre passerelle WebSocket ici
})
export class AppModule {}
