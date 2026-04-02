import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, Req, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query() query: ListUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    return this.usersService.create(createUserDto, req.user.userId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    return this.usersService.update(id, updateUserDto, req.user.userId);
  }

  @Patch(':id/toggle')
  async toggleActivo(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.usersService.toggleActivo(id, req.user.userId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.usersService.remove(id, req.user.userId);
  }
}
