import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name)
    private readonly jobModel: SoftDeleteModel<JobDocument>,
  ) {}

  async create(createJobDto: CreateJobDto, currentUser: IUser) {
    console.log(createJobDto);
    const {
      name,
      skills,
      company,
      location,
      salary,
      quantity,
      level,
      description,
      startDate,
      endDate,
      isActive,
    } = createJobDto;
    const newJob = await this.jobModel.create({
      name,
      skills,
      company,
      location,
      salary,
      quantity,
      level,
      description,
      startDate,
      endDate,
      isActive,
      createdBy: {
        _id: currentUser._id,
        name: currentUser.name,
      },
    });
    //console.log(job);
    return {
      _id: newJob._id,
      createAt: newJob.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    //console.log(offset, defaultLimit, filter);

    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.jobModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
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
      const job = await this.jobModel.findOne({ _id: id });
      return {
        job,
      };
    } catch (error) {
      throw new BadRequestException('Find job error');
    }
  }

  async update(id: string, updateJobDto: UpdateJobDto, currentUser: IUser) {
    try {
      return await this.jobModel.updateOne(
        {
          _id: id,
        },
        {
          ...updateJobDto,
          updatedBy: {
            _id: currentUser._id,
            name: currentUser.name,
          },
        },
      );
    } catch (error) {
      throw new BadRequestException('Update error');
    }
  }

  async remove(id: string, currentUser: IUser) {
    await this.jobModel.updateOne(
      {
        _id: id,
      },
      {
        deletedBy: {
          _id: currentUser._id,
          name: currentUser.name,
        },
      },
    );
    return await this.jobModel.softDelete({ _id: id });
  }
}
