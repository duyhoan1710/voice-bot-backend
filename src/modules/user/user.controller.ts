import { Roles } from '@src/common/decorators/roles.decorator';
import { JwtGuard } from '@src/guards/jwt.guard';
import {
  UpdateProfileUser,
  UpdatePasswordUser,
  QueryUserDto,
  AdminUpgradeVip,
} from './dtos/user.dto';
import { UserService } from './user.service';
import { Body, Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/profile')
  getProfile(@Req() req: Request) {
    const userId = req.user.userId;

    return this.userService.getProfile({ userId });
  }
}
