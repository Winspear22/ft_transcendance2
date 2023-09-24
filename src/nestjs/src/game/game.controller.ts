import { Controller, Get, Res } from '@nestjs/common';
import { get } from 'http';
import { Public } from 'src/decorators/public.decorator';
import { Response } from 'express';
import * as path from 'path';

@Controller('game')
export class GameController {
 
    @Public()
    @Get()
    async coucou(@Res() res: Response) {
      }
}