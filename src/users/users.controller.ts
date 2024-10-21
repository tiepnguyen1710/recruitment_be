import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from 'src/auth/auth.guard';
import { User, UserDocument } from './schemas/user.schema';
import { ResponseMessage, User as UserDecorator} from 'src/decorators/customize'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from './users.interface';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService,
    @InjectModel(User.name)
    private readonly model: SoftDeleteModel<UserDocument>,) {}

  @Post()
  @ResponseMessage('Create a new user')
  create(@Body() createUserDto : CreateUserDto, @UserDecorator() currentUser : IUser){
    //console.log(createUserDto);
    return this.usersService.create(createUserDto, currentUser);
  }

  @Get()
  //@UseGuards(RolesGuard)
  findAll(@Query('current') currentpage : string,
        @Query('pageSize') limit : string,
        @Query() qs : string) {
    return this.usersService.findAll(+currentpage, +limit, qs);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch()
  @ResponseMessage('Update a user')
  update(@Body() updateUserDto: UpdateUserDto, @UserDecorator() currentUser : IUser) {
    return this.usersService.update(updateUserDto, currentUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @UserDecorator() currentUser : IUser) {
    return this.usersService.remove(id, currentUser);
  }
}
