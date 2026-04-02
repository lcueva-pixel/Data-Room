import { Injectable, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected shouldSkip(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (req.method === 'OPTIONS') {
      return Promise.resolve(true);
    }
    return super.shouldSkip(context);
  }

  protected throwThrottlingException(
    context: ExecutionContext,
  ): Promise<void> {
    const req = context.switchToHttp().getRequest();
    if (req.url?.includes('/auth/login')) {
      throw new HttpException(
        'Demasiados intentos de inicio de sesión, vuelva a intentar en un minuto',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    throw new HttpException(
      'Demasiadas peticiones, intente de nuevo en un momento',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
