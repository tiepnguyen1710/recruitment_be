import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from 'src/auth/auth.guard';
import { User, UserDocument } from './schemas/user.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService,
    @InjectModel(User.name)
    private readonly model: SoftDeleteModel<UserDocument>,) {}

  @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  create(@Body() createUserDto : CreateUserDto){
    //console.log(createUserDto);
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch()
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.model.softDelete({_id : id});
  }
}
