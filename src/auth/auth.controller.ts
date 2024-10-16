import { Controller, Get, Post, Render, UseGuards, Request, Body } from '@nestjs/common';
import { Public, ResponseMessage } from 'src/decorators/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';


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

  @Public()
  @ResponseMessage('Register user')
  @Post('register')
  async register(@Body() registerUserDto : RegisterUserDto){
    return this.authService.register(registerUserDto)
  }

  // @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
