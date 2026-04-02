import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogActivityRecord } from './types/log.types';

@Injectable()
export class LogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.logActivity.findMany({
      orderBy: { fechaHora: 'desc' },
      include: {
        usuario: { select: { nombreCompleto: true, email: true } },
      },
    });
  }

  async register(record: LogActivityRecord) {
    return this.prisma.logActivity.create({
      data: {
        usuarioId: record.usuarioId ?? null,
        accion: record.accion,
        detalle: record.detalle,
        nivel: record.nivel ?? 'INFO',
      },
    });
  }
}
