import { Repository, EntityRepository } from 'typeorm';
import { MessageEntity } from './message.entity';

@EntityRepository(MessageEntity)
export class MessageRepository extends Repository<MessageEntity> {}
