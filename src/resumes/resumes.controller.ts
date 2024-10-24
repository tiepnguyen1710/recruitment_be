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
import { ResumesService } from './resumes.service';
import { CreateCVDto, CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import { ResponseMessage, User } from 'src/decorators/customize';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  @ResponseMessage('Create new CV')
  create(@Body() createCVDto: CreateCVDto, @User() currentUser: IUser) {
    return this.resumesService.create(createCVDto, currentUser);
  }

  @Get()
  @ResponseMessage('Fetch with paginate')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.resumesService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Find resume by id')
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update status resume')
  update(
    @Param('id') id: string,
    @Body('status') status: string,
    @User() currentUser: IUser,
  ) {
    return this.resumesService.update(id, status, currentUser);
  }

  @Delete(':id')
  @ResponseMessage('Delete a resume')
  remove(@Param('id') id: string, @User() currentUser: IUser) {
    return this.resumesService.remove(id, currentUser);
  }

  @Post('by-user')
  @ResponseMessage('Get resume by user')
  getAllByUser(@User() currentUser: IUser) {
    return this.resumesService.getAllByUser(currentUser);
  }
}
