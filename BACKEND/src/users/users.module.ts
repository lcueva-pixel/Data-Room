import { Module } from '@nestjs/common';
import { LogModule } from '../log/log.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [LogModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
