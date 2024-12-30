import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { IUser } from 'src/users/users.interface';
import { Role, RoleDocument } from './schemas/role.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { ADMIN_ROLE } from 'src/databases/sample';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name)
    private readonly roleModel: SoftDeleteModel<RoleDocument>,
  ) {}
  async create(createRoleDto: CreateRoleDto, currentUser: IUser) {
    const { name } = createRoleDto;
    const existName = await this.roleModel.findOne({ name });
    console.log(existName);
    if (!existName) {
      try {
        const role = await this.roleModel.create({
          ...createRoleDto,
          createdBy: {
            _id: currentUser._id,
            name: currentUser.name,
          },
        });
        return {
          _id: role._id,
          createAt: new Date(),
        };
      } catch (error) {
        throw new BadRequestException(`Create error: ${error}`);
      }
    } else {
      throw new BadRequestException(`Create error: Exist name`);
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    //console.log(offset, defaultLimit, filter);

    const totalItems = (await this.roleModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.roleModel
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found role');
    }
    try {
      const role = (await this.roleModel.findById(id)).populate({
        path: 'permissions',
        select: { _id: 1, name: 1, apiPath: 1, method: 1, module: 1 },
      });
      if (role) {
        return role;
      } else {
        throw new BadRequestException(`Role is not exist`);
      }
    } catch (error) {
      throw new BadRequestException(`Get role ${error}`);
    }
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, currentUser: IUser) {
    try {
      return await this.roleModel.updateOne(
        { _id: id },
        {
          ...updateRoleDto,
          updatedBy: {
            _id: currentUser._id,
            name: currentUser.name,
          },
        },
      );
    } catch (error) {
      throw new BadRequestException(`Update error: ${error}`);
    }
  }

  async remove(id: string, currentUser: IUser) {
    const adminRole = this.roleModel.findOne({ name: ADMIN_ROLE });
    if (adminRole) {
      throw new BadRequestException('Cannot remove admin role');
    }
    await this.roleModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: currentUser._id,
          name: currentUser.name,
        },
      },
    );
    return this.roleModel.softDelete({ _id: id });
  }
}
