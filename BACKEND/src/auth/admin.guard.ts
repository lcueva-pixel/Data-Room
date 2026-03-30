import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    // Suponiendo que el rol de admin es rol_id = 1
    if (request.user && request.user.rol_id === 1) {
      return true;
    }
    throw new ForbiddenException('Solo el administrador puede realizar esta acción');
  }
}
