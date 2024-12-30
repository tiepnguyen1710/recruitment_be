import {
  Controller,
  Get,
  Post,
  Render,
  UseGuards,
  Body,
  Req,
  Res,
} from '@nestjs/common';
import { Public, ResponseMessage, User } from 'src/decorators/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterUserDto, UserLoginDto } from 'src/users/dto/create-user.dto';
import { Request, Response } from 'express';
import { IUser } from 'src/users/users.interface';
import { RolesService } from 'src/roles/roles.service';
import { ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private roleService: RolesService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: UserLoginDto })
  @Post('login')
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(req.user, res);
  }

  @Public()
  @ResponseMessage('Register user')
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  // @UseGuards(JwtAuthGuard)
  @Get('account')
  @ResponseMessage('Get user information')
  async getProfile(@User() user: IUser) {
    const tmp = (await this.roleService.findOne(user.role?._id)) as any;
    user.permissions = tmp.permissions;
    return { user };
  }

  @Public()
  @Get('refresh')
  @ResponseMessage('Get refresh token')
  refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    let refresh_token = req.cookies['refresh_token'];
    return this.authService.processRefresh(refresh_token, res);
  }

  @Post('logout')
  @ResponseMessage('Log out')
  handleLogout(@Res({ passthrough: true }) res: Response, @User() user: IUser) {
    return this.authService.logout(res, user);
  }
}
