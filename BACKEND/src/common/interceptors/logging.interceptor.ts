import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LogService } from '../../log/log.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly logService: LogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, user } = req;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - now;
        this.logger.log(`${method} ${url} — ${ms}ms`);
      }),
      catchError((error) => {
        const ms = Date.now() - now;
        const status = error?.status || error?.getStatus?.() || 500;

        if (status >= 500) {
          this.logService.register({
            usuarioId: user?.userId ?? null,
            accion: 'ERROR_SERVIDOR',
            detalle: `${method} ${url} [${status}] — ${error.message ?? 'Error interno'}`,
            nivel: 'ERROR',
          }).catch(() => {});
        }

        this.logger.error(`${method} ${url} ${status} — ${ms}ms — ${error.message}`);
        return throwError(() => error);
      }),
    );
  }
}
