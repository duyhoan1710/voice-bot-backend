import { JwtGuard } from '@src/guards/jwt.guard';
import { RoomService } from './room.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { RoomRequestDto } from './dtos/room.dto';

@ApiTags('Rooms')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get('/')
  getRooms(@Req() req: Request) {
    const userId = req.user.userId;

    return this.roomService.getListRooms({ userId });
  }

  @Post('/')
  createRoom(@Req() req: Request, @Body() body: RoomRequestDto) {
    const userId = req.user.userId;
    return this.roomService.createRoom({ userId, ...body });
  }

  @Put('/:roomId')
  updateRoom(@Req() req: Request, @Body() body: RoomRequestDto) {
    const userId = req.user.userId;
    const { roomId } = req.params;

    return this.roomService.updateRoom({ userId, roomId, ...body });
  }

  @Delete('/:roomId')
  deleteRoom(@Req() req: Request) {
    const userId = req.user.userId;
    const { roomId } = req.params;

    return this.roomService.updateRoom({ userId, roomId });
  }
}
