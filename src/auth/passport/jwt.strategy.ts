import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from 'src/users/users.interface';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private roleService: RolesService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SECRET_KEY_ACCESS'),
    });
  }

  async validate(payload: IUser) {
    const { _id, name, email, role } = payload;
    const userRole = (await this.roleService.findOne(role._id)).toObject();
    //assign to req.user
    return {
      _id,
      name,
      email,
      role,
      permissions: userRole?.permissions ?? [],
    };
  }
}
