import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
