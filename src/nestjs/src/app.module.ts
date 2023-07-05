import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleStrategy } from './google.strategy';
import { GoogleAuthGuard } from './google-auth.guard';
import { EventGateway } from './websocket.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
//import { FtStrategy } from './ft.strategy';
import { SessionSerializer } from './session.serializer';
import { UserEntity } from './user.entity';
import { UserModule } from './user.module'; // Assurez-vous que le chemin est correct
import { IntraStrategy } from './ft.strategy'
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'postgresql',
      port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [UserEntity],
      synchronize: true,
    }),
    UserModule, // Ajoutez cette ligne
    HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService, GoogleStrategy, GoogleAuthGuard, EventGateway, IntraStrategy, SessionSerializer],
})
export class AppModule {}
