import { Controller, Get, Req, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
//import { Session } from 'express-session';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string 
  {
    return this.appService.getHello();
  }

  @Get('cookies')
  getCookies(@Req() request: Request) 
  {
    return request.cookies;
  }

  @Get('session')
  getSession(@Req() request: Request) 
  {
    return request.session;
  }

  @Post()
  handleLogin(@Body() data: any) 
  {
    console.log('Message from Vue.js:', data);
  }
}