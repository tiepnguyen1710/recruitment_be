import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IUser } from 'src/users/users.interface';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private readonly permissionModel: SoftDeleteModel<PermissionDocument>,
  ) {}
  async create(createPermissionDto: CreatePermissionDto, currentUser: IUser) {
    let { apiPath, method } = createPermissionDto;
    const existPermission = await this.permissionModel.find({
      apiPath,
      method,
    });
    if (!existPermission.length) {
      try {
        const permission = await this.permissionModel.create({
          ...createPermissionDto,
          createdBy: {
            _id: currentUser._id,
            name: currentUser.name,
          },
        });

        return {
          _id: permission._id,
          createAt: new Date(),
        };
      } catch (error) {
        throw new BadRequestException(`Create permisstion ${error}`);
      }
    } else {
      throw new BadRequestException(`Permission is existed`);
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    //console.log(offset, defaultLimit, filter);

    const totalItems = (await this.permissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.permissionModel
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
      const permission = await this.permissionModel.findOne({ _id: id });
      if (permission) {
        return permission;
      } else {
        throw new BadRequestException(`Permission is not exist`);
      }
    } catch (error) {
      throw new BadRequestException(`Get permisstion ${error}`);
    }
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
    currentUser: IUser,
  ) {
    try {
      return await this.permissionModel.updateOne(
        { _id: id },
        {
          ...updatePermissionDto,
          updatedBy: {
            _id: currentUser._id,
            name: currentUser.name,
          },
        },
      );
    } catch (error) {
      throw new BadRequestException(`Create permisstion ${error}`);
    }
  }

  async remove(id: string, currentUser: IUser) {
    await this.permissionModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: currentUser._id,
          name: currentUser.name,
        },
      },
    );
    return this.permissionModel.softDelete({ _id: id });
  }
}
