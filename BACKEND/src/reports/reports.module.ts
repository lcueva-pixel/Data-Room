import { Module } from '@nestjs/common';
import { LogModule } from '../log/log.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [LogModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
