import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService,
            private jwtService: JwtService,
            @InjectModel(User.name)
    private readonly userModel: SoftDeleteModel<UserDocument>) {}

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(username);
        if(user){
            if(this.usersService.IsCorrectPassword(pass, user.password)){
                return user;
            }
        }
        return null;
    }

    async login(user: IUser) {
        const { _id, name, email, role } = user;
        const payload = { 
            sub: "token login",
            iss: "from server",
            _id,
            name,
            email,
            role
        };
        return {
          access_token: this.jwtService.sign(payload),
          _id,
          name,
          email,
          role
        };
      }

    async register(registerUserDto : RegisterUserDto){
        let existEmail = await this.userModel.findOne({email : registerUserDto.email});
        if(existEmail){
            return {

            }
        }

        else {
            let hashPassword = this.usersService.getHashPassword(registerUserDto.password);

            let user = await this.userModel.create({
                ...registerUserDto,
                password : hashPassword
            })

            return {
                _id : user._id,
                createdAt : user.createdAt
            }
        }
        
    }
}
