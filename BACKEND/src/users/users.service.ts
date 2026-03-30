import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { buildPaginatedResponse } from '../common/dto/paginated-response.dto';

const VALID_SORT_FIELDS = ['id', 'nombreCompleto', 'email', 'fechaCreacion'] as const;
type ValidSortField = (typeof VALID_SORT_FIELDS)[number];

function toValidSortField(field?: string): ValidSortField {
  if (field && VALID_SORT_FIELDS.includes(field as ValidSortField)) {
    return field as ValidSortField;
  }
  return 'id';
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListUsersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const sortBy = toValidSortField(query.sortBy);
    const order = query.order ?? 'asc';

    const where: Record<string, unknown> = {};

    if (query.search) {
      where.OR = [
        { nombreCompleto: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.rolId !== undefined) where.rolId = query.rolId;
    if (query.activo !== undefined) where.activo = query.activo;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        select: {
          id: true,
          nombreCompleto: true,
          email: true,
          rolId: true,
          activo: true,
          fechaCreacion: true,
          rol: { select: { rolDescripcion: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  async create(dto: CreateUserDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.create({
      data: {
        nombreCompleto: dto.nombreCompleto,
        email: dto.email,
        passwordHash: hash,
        rolId: dto.rolId,
        activo: dto.activo ?? true,
      },
    });
    return { message: 'Usuario creado exitosamente' };
  }

  async update(id: number, dto: UpdateUserDto) {
    const data: Record<string, unknown> = {};
    if (dto.nombreCompleto !== undefined) data.nombreCompleto = dto.nombreCompleto;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.rolId !== undefined) data.rolId = dto.rolId;
    if (dto.activo !== undefined) data.activo = dto.activo;
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
    }
    await this.prisma.user.update({ where: { id }, data });
    return { message: 'Usuario actualizado exitosamente' };
  }

  async toggleActivo(id: number) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    const updated = await this.prisma.user.update({
      where: { id },
      data: { activo: !user.activo },
      select: {
        id: true,
        nombreCompleto: true,
        email: true,
        rolId: true,
        activo: true,
        fechaCreacion: true,
        rol: { select: { rolDescripcion: true } },
      },
    });
    return updated;
  }

  async remove(id: number) {
    await this.prisma.user.update({
      where: { id },
      data: { activo: false },
    });
    return { message: 'Usuario desactivado exitosamente' };
  }
}
