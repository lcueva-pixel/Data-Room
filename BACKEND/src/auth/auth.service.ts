import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LogService } from '../log/log.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly logService: LogService,
  ) {}

  async validateUser(
    email: string,
    password: string,
    userAgent: string,
  ) {
    const user = await this.prisma.user.findFirst({
      where: { email, activo: true },
    });

    if (!user) {
      await this.logService.register({
        usuarioId: null,
        accion: 'LOGIN_FALLIDO',
        detalle: `Email no encontrado: ${email}`,
        nivel: 'WARN',
      });
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      await this.logService.register({
        usuarioId: user.id,
        accion: 'LOGIN_FALLIDO',
        detalle: `Password incorrecto para: ${email}`,
        nivel: 'WARN',
      });
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    await this.prisma.auditAccess.create({
      data: { usuarioId: user.id, userAgent },
    });

    await this.logService.register({
      usuarioId: user.id,
      accion: 'LOGIN_EXITOSO',
      detalle: `Login exitoso: ${email}`,
      nivel: 'INFO',
    });

    return user;
  }

  async login(user: { id: number; rolId: number; email: string; nombreCompleto: string }) {
    const payload = { sub: user.id, rol_id: user.rolId };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nombreCompleto: user.nombreCompleto,
        rol_id: user.rolId,
      },
    };
  }
}
