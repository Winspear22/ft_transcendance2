import { AuthGuard } from "@nestjs/passport";
import { UserService } from './user.service'
import { UserEntity } from './user.entity';
import { Controller, Get, Req, Patch, Param, Query, Delete, Res, ForbiddenException } from "@nestjs/common"

@Controller('user')
export class UserController {
	constructor (
		private readonly userService: UserService,
	) {}
}