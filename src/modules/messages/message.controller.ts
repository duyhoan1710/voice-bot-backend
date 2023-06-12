import { MessageRequestDto } from './dtos/message.dto';
import { JwtGuard } from '@src/guards/jwt.guard';

import { MessageService } from './message.service';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Messages')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('rooms/:roomId/messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('/')
  @ApiParam({
    name: 'roomId',
    type: 'number',
  })
  getMessages(@Req() req: Request) {
    const userId = req.user.userId;
    const { roomId } = req.params;

    return this.messageService.getListMessage({ userId, roomId });
  }

  @Post('/')
  @ApiParam({
    name: 'roomId',
    type: 'number',
  })
  createMessage(@Req() req: Request, @Body() body: MessageRequestDto) {
    const userId = req.user.userId;
    const { roomId } = req.params;

    return this.messageService.createMessage({
      userId,
      roomId,
      ...body,
    });
  }
}
