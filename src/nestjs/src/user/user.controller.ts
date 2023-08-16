import { AuthGuard } from "@nestjs/passport";
import { UserService } from './user.service'
import { UserEntity } from './user.entity';
import { Controller, Get, Req,
	Patch,
	Param,
	Query,
	Delete,
	Res,
	Post,
	Body,
	 } from "@nestjs/common"
import { UseGuards } from "@nestjs/common";
import { Request, Response } from "express";
import { JwtAuthGuard } from "src/auth/guard/jwt-guard.guard";

@Controller('user')
export class UserController {
	constructor (
		private readonly userService: UserService,
	) {}

	@Post('change/username')
	@UseGuards(JwtAuthGuard)
	ChangeUsername(@Body() username: string,
	@Req() req: Request, @Res({passthrough: true}) res: Response)
	{
		const user = req.user as UserEntity;
		console.log("user === ", user);
		return this.userService.UpdateUser(user, res);
	}
}