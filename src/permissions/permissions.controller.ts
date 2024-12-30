import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ResponseMessage, User } from 'src/decorators/customize';
import { IUser } from 'src/users/users.interface';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @ResponseMessage('Create permission')
  create(
    @Body() createPermissionDto: CreatePermissionDto,
    @User() currentUser: IUser,
  ) {
    return this.permissionsService.create(createPermissionDto, currentUser);
  }

  @Get()
  @ResponseMessage('Fetch all permissions')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.permissionsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Fetch permission by id')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update permission')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @User() currentUser: IUser,
  ) {
    return this.permissionsService.update(id, updatePermissionDto, currentUser);
  }

  @Delete(':id')
  @ResponseMessage('Delete permission')
  remove(@Param('id') id: string, @User() currentUser: IUser) {
    return this.permissionsService.remove(id, currentUser);
  }
}
