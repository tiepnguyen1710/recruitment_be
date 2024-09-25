import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  getHashPassword = (password : string) => {
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  }
  
  // create(createUserDto: CreateUserDto) {
  async create(createUserDto : CreateUserDto) {
    const hashPassword = this.getHashPassword(createUserDto.password);
    let user = await this.userModel.create({
      email : createUserDto.email,
      password: hashPassword,
      name : createUserDto.name
    })
    return user;
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string) {
    try {
      let user = await this.userModel.findOne({
        _id : id
      })
      if (!user) {
        throw new Error('User not found'); 
      }
      return user;
    } catch (error) {
      throw new Error(`Failed to retrieve user: ${error.message}`);
    }
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne({_id : updateUserDto._id}, {...updateUserDto});
  }

  async remove(id: string) {
    return await this.userModel.deleteOne({_id : id})
  }
}
