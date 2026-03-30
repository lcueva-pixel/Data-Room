import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { CreateReportViewDto } from './dto/create-report-view.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.auditService.findAll();
  }

  @Post('report-time')
  async registerReportTime(
    @Req() req: any,
    @Body() dto: CreateReportViewDto,
  ) {
    try {
      await this.auditService.registerReportView(req.user.userId, dto);
      return { ok: true };
    } catch {
      throw new NotFoundException('Reporte no encontrado');
    }
  }
}
