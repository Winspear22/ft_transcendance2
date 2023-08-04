import { Controller, Get } from '@nestjs/common';

@Controller('home')
export class HomeController 
{
    @Get('/')
    Home() {
      return 'Welcome to the Welcome Page';
    }
}
