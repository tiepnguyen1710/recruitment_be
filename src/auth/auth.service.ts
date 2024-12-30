import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import ms from 'ms';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private roleService: RolesService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(username);
    console.log('user', user);
    if (user) {
      if (this.usersService.IsCorrectPassword(pass, user.password)) {
        const userRole = user.role as unknown as { _id: string; name: string };
        const tmp = await this.roleService.findOne(userRole._id);

        const objUser = {
          ...user.toObject(),
          permissions: tmp?.permissions ?? [],
        };
        //console.log(objUser);
        return objUser;
      }
    }
    return null;
  }

  async login(user: IUser, res: Response) {
    let { _id, name, email, role, permissions } = user;

    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
      role,
    };

    let refresh_token = this.createRefreshToken(payload);

    await this.usersService.assignRefreshToken(refresh_token, _id);

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('EXPIRE_IN_REFRESH')),
    });

    return {
      access_token: this.jwtService.sign(payload),
      _id,
      name,
      email,
      role,
      permissions,
    };
  }

  async register(user: RegisterUserDto) {
    const newUser = await this.usersService.register(user);

    return {
      _id: newUser._id,
      name: newUser.name,
    };
  }

  createRefreshToken(payload) {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('SECRET_KEY_REFRESH'),
      expiresIn: this.configService.get<string>('EXPIRE_IN_REFRESH'),
    });

    return refresh_token;
  }

  async processRefresh(refresh_token: string, res: Response) {
    try {
      this.jwtService.verify(refresh_token, {
        secret: this.configService.get<string>('SECRET_KEY_REFRESH'),
      });

      let user = await this.usersService.checkRefreshTokenUser(refresh_token);
      if (user) {
        let { _id, name, email, role } = user;

        const payload = {
          sub: 'token refresh',
          iss: 'from server',
          _id,
          name,
          email,
          role,
        };

        let new_refresh_token = this.createRefreshToken(payload);

        await this.usersService.assignRefreshToken(
          new_refresh_token,
          _id.toString(),
        );

        res.clearCookie('refresh_token');

        res.cookie('refresh_token', new_refresh_token, {
          httpOnly: true,
          maxAge: ms(this.configService.get<string>('EXPIRE_IN_REFRESH')),
        });

        const userRole = user.role as unknown as { _id: string; name: string };
        const tmp = await this.roleService.findOne(userRole._id);

        return {
          access_token: this.jwtService.sign(payload),
          user: {
            _id,
            name,
            email,
            role,
            permissions: tmp?.permissions ?? [],
          },
        };
      } else {
        throw new BadRequestException('Refresh token invalid');
      }
    } catch (error) {
      throw new BadRequestException('Refresh token invalid');
    }
  }

  async logout(res: Response, user: IUser) {
    await this.usersService.assignRefreshToken('', user._id);
    res.clearCookie('refresh_token');
    return 'Logout successful';
  }
}
