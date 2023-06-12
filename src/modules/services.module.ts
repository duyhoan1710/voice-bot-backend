import { Logger } from './../common/helpers/logger';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AppMiddleware } from '@src/middlewares';
import { RoomModule } from './rooms/room.module';
import { MessageModule } from './messages/message.module';

@Module({
  imports: [AuthModule, UserModule, RoomModule, MessageModule],
  providers: [Logger],
  exports: [],
})
export class ServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppMiddleware).forRoutes('*');
  }
}
