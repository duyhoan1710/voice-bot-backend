import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { RoomRepository } from './room.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

const repositories = [RoomRepository];

@Module({
  imports: [TypeOrmModule.forFeature(repositories)],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [],
})
export class RoomModule {}
