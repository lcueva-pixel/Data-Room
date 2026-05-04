import { Controller, Get, Post, Put, Delete, Patch, Req, UseGuards, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ListReportsQueryDto } from './dto/list-reports-query.dto';
import { ReorderReportsDto } from './dto/reorder-reports.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.reportsService.findByRole(req.user.rol_id, req.user.userId);
  }

  @Get('admin')
  @UseGuards(AdminGuard)
  async findAllAdmin(@Query() query: ListReportsQueryDto) {
    return this.reportsService.findAllAdmin(query);
  }

  @Get('admin/all-flat')
  @UseGuards(AdminGuard)
  async findAllAdminFlat() {
    return this.reportsService.findAllAdminFlat();
  }

  @Get(':id/children')
  @UseGuards(AdminGuard)
  async findChildren(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.findChildren(id);
  }

  @Patch('reorder')
  @UseGuards(AdminGuard)
  async reorder(@Body() dto: ReorderReportsDto, @Req() req: any) {
    return this.reportsService.reorder(
      dto.padreId ?? null,
      dto.orderedIds,
      req.user.userId,
    );
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() createReportDto: CreateReportDto, @Req() req: any) {
    return this.reportsService.create(createReportDto, req.user.userId);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReportDto: UpdateReportDto,
    @Req() req: any,
  ) {
    return this.reportsService.update(id, updateReportDto, req.user.userId);
  }

  @Patch(':id/toggle')
  @UseGuards(AdminGuard)
  async toggleActivo(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.reportsService.toggleActivo(id, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.reportsService.remove(id, req.user.userId);
  }
}
