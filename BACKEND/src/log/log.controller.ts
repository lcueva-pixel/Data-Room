import { Controller, Get, UseGuards } from '@nestjs/common';
import { LogService } from './log.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('logs')
@UseGuards(JwtAuthGuard)
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  findAll() {
    return this.logService.findAll();
  }
}
