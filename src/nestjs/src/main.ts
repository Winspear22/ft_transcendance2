import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session'
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';


async function bootstrap() 
{
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: '*', // Autorisez seulement ce domaine
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Méthodes autorisées
  });
    app.use(cookieParser());
  app.use(session({ resave: false, saveUninitialized: false, secret: 'toto'}));

  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(3000);
}
bootstrap();
