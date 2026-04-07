import { Controller, Post, Body, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    const userAgent = req.headers['user-agent'] || '';
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
      userAgent,
    );
    return this.authService.login(user);
  }
}
