import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    await this.prisma.auditAccess.create({
      data: { usuarioId: user.id, userAgent },
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
