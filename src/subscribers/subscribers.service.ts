import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { IUser } from 'src/users/users.interface';
import { Subscriber, SubscriberDocument } from './schemas/subscriber.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class SubscribersService {
  constructor(
    // @InjectModel(Subscriber.name)
    // private readonly subcriberModel: SoftDeleteModel<SubscriberDocument>,
    @InjectModel(Subscriber.name) private subcriberModel: Model<Subscriber>,
  ) {}
  async create(createSubscriberDto: CreateSubscriberDto, currentUser: IUser) {
    try {
      const subscriber = await this.subcriberModel.create({
        ...createSubscriberDto,
        createdBy: {
          _id: currentUser._id,
          name: currentUser.name,
        },
      });
      return subscriber;
    } catch (error) {
      throw new BadRequestException(`Create sub error ${error}`);
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    console.log(population, projection);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    //console.log(offset, defaultLimit, filter);

    const totalItems = (await this.subcriberModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.subcriberModel
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
        throw new BadRequestException('Find Sub error');
      } else {
        const subscriber = await this.subcriberModel.findOne({ _id: id });
        return subscriber;
      }
    } catch (error) {
      throw new BadRequestException('Find Sub error');
    }
  }

  async update(updateSubscriberDto: UpdateSubscriberDto, currentUser: IUser) {
    try {
      const updated = await this.subcriberModel.updateOne(
        {
          email: currentUser.email,
        },
        {
          ...updateSubscriberDto,
          updatedBy: {
            _id: currentUser._id,
            name: currentUser.name,
          },
        },
        {
          upsert: true,
        },
      );
      return updated;
    } catch (error) {
      throw new BadRequestException(`Update sub error ${error}`);
    }
  }

  async remove(id: string) {
    try {
      return await this.subcriberModel.updateOne(
        { _id: id },
        { isDelete: false },
      );
    } catch (error) {
      throw new BadRequestException(`Remove sub error ${error}`);
    }
  }

  async getUserSkills(currentUser: IUser) {
    const { email } = currentUser;
    return this.subcriberModel.findOne({ email }, { skills: 1 });
  }
}
