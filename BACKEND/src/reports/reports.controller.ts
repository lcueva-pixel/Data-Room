import { Controller, Get, Post, Put, Delete, Patch, Req, UseGuards, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ListReportsQueryDto } from './dto/list-reports-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.reportsService.findByRole(req.user.rol_id);
  }

  @Get('admin')
  @UseGuards(AdminGuard)
  async findAllAdmin(@Query() query: ListReportsQueryDto) {
    return this.reportsService.findAllAdmin(query);
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(createReportDto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    return this.reportsService.update(id, updateReportDto);
  }

  @Patch(':id/toggle')
  @UseGuards(AdminGuard)
  async toggleActivo(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.toggleActivo(id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.remove(id);
  }
}
