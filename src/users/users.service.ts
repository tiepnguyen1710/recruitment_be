import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { IUser } from './users.interface';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name)
  private readonly userModel: SoftDeleteModel<UserDocument>,) {}

  getHashPassword = (password : string) => {
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  }
  
  // create(createUserDto: CreateUserDto) {
  async create(createUserDto : CreateUserDto, currentUser : IUser) {
    let existEmail = await this.userModel.findOne({email : createUserDto.email});
        if(existEmail){
            return {

            }
        }

    const hashPassword = this.getHashPassword(createUserDto.password);
    let user = await this.userModel.create({
      ...createUserDto,
      password : hashPassword,
      createdBy: {
        _id : currentUser._id,
        name: currentUser.name
      }
    })
    return {
      _id : user._id,
      createAt: user.createdAt
    }
  }

  IsCorrectPassword(password : string, hash : string) : boolean{
    return bcrypt.compareSync(password, hash);
  }

  async findAll(currentPage : number, limit : number, qs : string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.page
    console.log(filter);
    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 5;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);


    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select('-password')
      .exec();

    return {
      meta: {
        current: currentPage, 
        pageSize: limit, 
        pages: totalPages, 
        total: totalItems,
      },
      result, 
    };
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

  async findOneByEmail(email : string) : Promise<User | undefined>{
    try {
      let user = this.userModel.findOne({email : email});
      if (!user) {
        throw new Error('User not found'); 
      }

      return user;
    } catch (error) {
      throw new Error(`Failed to retrieve user: ${error.message}`);
    }
  }

  async update(updateUserDto: UpdateUserDto, currentUser : IUser) {
    try {
      return await this.userModel.updateOne(
        {
          _id : updateUserDto._id
        }, 
        {
          ...updateUserDto,
          updatedBy : {
            _id : currentUser._id,
            name : currentUser.name
          }
        });
      
        
    } catch (error) {
      throw new Error(`Failed to retrieve user: ${error.message}`);
    }
    
  }

  async remove(id: string, currentUser : IUser) {
    await this.userModel.updateOne({
      _id : id
    }, {
      deletedBy: {
        _id : currentUser._id,
        name : currentUser.name
      }
    })
    return await this.userModel.softDelete({_id : id}, )
  }
}
