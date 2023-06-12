import { RoomEntity } from '../rooms/room.entity';
import { UserEntity } from '@src/modules/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BaseEntity } from '@src/common/entities/base.entity';

@Entity({ name: 'messages' })
export class MessageEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column('varchar', { name: 'role', nullable: false })
  role: string;

  @Column('varchar', { name: 'content', nullable: false })
  content: string;

  @Column('int', { name: 'user_id', nullable: true })
  userId: string;

  @Column('int', { name: 'room_id', nullable: false })
  roomId: string;

  @ManyToOne(() => UserEntity, (user) => user.messages)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity[];

  @ManyToOne(() => RoomEntity, (room) => room.messages)
  @JoinColumn({ name: 'room_id', referencedColumnName: 'id' })
  room: RoomEntity[];
}
