import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessageRepository } from './message.repository';

const repositories = [MessageRepository];

@Module({
  imports: [TypeOrmModule.forFeature(repositories)],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [],
})
export class MessageModule {}
