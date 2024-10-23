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
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { IUser } from 'src/users/users.interface';
import { Public, ResponseMessage, User } from 'src/decorators/customize';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ResponseMessage('Create a job')
  create(@Body() createJobDto: CreateJobDto, @User() currentUser: IUser) {
    console.log(createJobDto);
    return this.jobsService.create(createJobDto, currentUser);
  }

  @Public()
  @Get()
  @ResponseMessage('Fetch jobs paginate')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.jobsService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @Get(':id')
  @ResponseMessage('Fetch job by id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update a job')
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @User() currentUser: IUser,
  ) {
    return this.jobsService.update(id, updateJobDto, currentUser);
  }

  @Delete(':id')
  @ResponseMessage('Delete a job')
  remove(@Param('id') id: string, @User() currentUser: IUser) {
    return this.jobsService.remove(id, currentUser);
  }
}
