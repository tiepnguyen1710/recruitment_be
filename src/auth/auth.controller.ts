import { Controller, Get, Post, Render, UseGuards, Request } from '@nestjs/common';
import { Public } from 'src/decorators/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';


@Controller('auth')
export class AuthController {
  constructor(
              private configService: ConfigService,
              private authService: AuthService) {}


  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
