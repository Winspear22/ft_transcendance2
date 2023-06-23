import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleStrategy } from './google.strategy';
import { GoogleAuthGuard } from './google-auth.guard';
import { EventGateway } from './websocket.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginController } from './app.controller';
import { FtStrategy } from './ft.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'postgresql',
      port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [],
      synchronize: true, // Garder à 'false' en production
    }),
    HttpModule,
  ],
  controllers: [AppController, LoginController],
  providers: [AppService, GoogleStrategy, GoogleAuthGuard, EventGateway, FtStrategy, SessionSerializer], // Ajoutez GoogleStrategy et GoogleAuthGuard ici
})
export class AppModule {}