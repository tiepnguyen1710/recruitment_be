import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCVDto, CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private readonly resumeModel: SoftDeleteModel<ResumeDocument>,
  ) {}

  async create(createCVDto: CreateCVDto, currentUser: IUser) {
    try {
      const newCV = await this.resumeModel.create({
        email: currentUser.email,
        userId: currentUser._id,
        ...createCVDto,
        history: {
          status: 'PENDING',
          updateAt: new Date(),
          updateBy: {
            _id: currentUser._id,
            email: currentUser.email,
          },
        },
        createdBy: {
          _id: currentUser._id,
          email: currentUser.email,
        },
      });

      return {
        _id: newCV._id,
        createAt: newCV.createdAt,
      };
    } catch (error) {
      throw new BadRequestException('Create CV error');
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    //console.log(offset, defaultLimit, filter);

    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.resumeModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
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
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Find CV error');
      } else {
        const resume = await this.resumeModel.findOne({ _id: id });
        return resume;
      }
    } catch (error) {
      throw new BadRequestException('Find CV error');
    }
  }

  async update(id: string, status: string, currentUser: IUser) {
    try {
      const resume = await this.findOne(id);
      return await this.resumeModel.updateOne(
        {
          _id: id,
        },
        {
          status,
          history: [
            ...resume.history,
            {
              status: status,
              updatedAt: new Date(),
              updatedBy: {
                _id: currentUser._id,
                email: currentUser.email,
              },
            },
          ],
        },
      );
    } catch (error) {
      throw new BadRequestException(`Update status CV ${error}`);
    }
  }

  async remove(id: string, currentUser: IUser) {
    try {
      await this.resumeModel.updateOne(
        {
          _id: id,
        },
        {
          deletedBy: {
            _id: currentUser._id,
            email: currentUser.email,
          },
        },
      );
      return await this.resumeModel.softDelete({ _id: id });
    } catch (error) {
      throw new BadRequestException(`Update status CV ${error}`);
    }
  }

  async getAllByUser(currentUser: IUser) {
    try {
      const id = currentUser._id;
      const resumes = await this.resumeModel.find({ userId: id });
      return resumes;
    } catch (error) {
      throw new BadRequestException(`Update status CV ${error}`);
    }
  }
}
