import { MessageEntity } from './../messages/message.entity';
import { RoomRepository } from './room.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RoomService {
  constructor(private readonly roomRepository: RoomRepository) {}

  async createRoom({ userId, ...body }) {
    return this.roomRepository.save({
      userId,
      isDelete: false,
      ...body,
    });
  }

  async updateRoom({ userId, roomId, ...body }) {
    this.roomRepository.update(
      {
        userId,
        id: roomId,
      },
      {
        ...body,
      },
    );
  }

  getListRooms({ userId }) {
    // return this.roomRepository
    //   .createQueryBuilder('room')
    //   .leftJoinAndSelect(
    //     (subquery) => {
    //       return subquery
    //         .select('MAX(message.created_at)', 'latest')
    //         .addSelect('message.room_id', 'room_id')
    //         .from(MessageEntity, 'message')
    //         .groupBy('message.room_id');
    //     },
    //     'latest_message',
    //     'latest_message.room_id = room.id',
    //   )
    //   .leftJoinAndMapOne(
    //     'room.latestMessage',
    //     MessageEntity,
    //     'message',
    //     'message.created_at = latest_message.latest',
    //   )
    //   .getMany();

    const qb = this.roomRepository.createQueryBuilder('room');

    return qb
      .leftJoin(
        () => {
          return qb
            .subQuery()
            .select('MAX(message.created_at)', 'latest')
            .addSelect('message.room_id')
            .from(MessageEntity, 'message')
            .groupBy('message.room_id');
        },
        'latestMessage',
        'latestMessage.room_id = room.id',
      )
      .leftJoinAndMapOne(
        'room.latestMessage',
        MessageEntity,
        'message',
        'message.created_at = latestMessage.latest',
      )
      .orderBy('room.id', 'DESC')
      .getMany();
  }

  deleteRoom({ userId, roomId }) {
    this.roomRepository.update(
      {
        userId,
        id: roomId,
      },
      {
        isDelete: true,
      },
    );
  }
}
