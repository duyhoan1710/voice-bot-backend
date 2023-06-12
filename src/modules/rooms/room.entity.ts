import { MessageEntity } from '../messages/message.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BaseEntity } from '@src/common/entities/base.entity';
import { UserEntity } from '@src/modules/user/user.entity';

@Entity({ name: 'rooms' })
export class RoomEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column('varchar', { name: 'name', nullable: false })
  name: string;

  @Column('int', { name: 'user_id', nullable: false })
  userId: string;

  @Column('boolean', { name: 'is_delete', nullable: false })
  isDelete: boolean;

  @ManyToOne(() => UserEntity, (user) => user.rooms)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;

  @OneToMany(() => MessageEntity, (message) => message.room)
  messages: MessageEntity[];
}
