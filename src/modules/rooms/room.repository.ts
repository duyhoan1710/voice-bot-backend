import { RoomEntity } from './room.entity';
import { Repository, EntityRepository } from 'typeorm';

@EntityRepository(RoomEntity)
export class RoomRepository extends Repository<RoomEntity> {}
