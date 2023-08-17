import { UserService } from './user.service'
import { UserEntity } from './user.entity';
import { Controller, Req,
	Res,
	Post,
	Body,
	HttpStatus,
	HttpCode,
	 } from "@nestjs/common"
import { UseGuards } from "@nestjs/common";
import { Request, Response } from "express";
import { JwtAuthGuard } from "src/auth/guard/jwt-guard.guard";
import { UpdateUserDto } from "./dto/updateuser.dto";

@Controller('user')
export class UserController {
	constructor (
		private readonly userService: UserService,
	) {}

	@Post('change/username')
	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.CREATED)
	async ChangeUsername(@Body() data: UpdateUserDto,
	@Req() req: Request, @Res({passthrough: true}) res: Response)
	{
		try
		{
			const user = req.user as UserEntity;
			await this.userService.UpdateUserUsernameSettings(user, res, data);
			const partialUser = await this.userService.returnPartialUserInfo(user.username);
			res.status(201).json({ message: 'Username successfully modified to ' + partialUser.username, partialUser });
		}
		catch
		{
			return ;
		}

	}

	@Post('change/email')
	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.CREATED)
	async ChangeEmail(@Body() data: UpdateUserDto,
	@Req() req: Request, @Res({passthrough: true}) res: Response)
	{
		try
		{
			const user = req.user as UserEntity;
			console.log(user);
			await this.userService.UpdateUserEmailSettings(user, res, data);
			const partialUser = await this.userService.returnPartialUserInfo(user.username);
			res.status(201).json({ message: 'Email successfully modified.', partialUser });
		}
		catch
		{
			return ;
		}
	}
}