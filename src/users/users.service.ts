import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { IUser } from './users.interface';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { ADMIN_ROLE } from 'src/databases/sample';
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: SoftDeleteModel<UserDocument>,

    @InjectModel(Role.name)
    private readonly roleModel: SoftDeleteModel<RoleDocument>,
  ) {}

  getHashPassword = (password: string) => {
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  };

  async assignRefreshToken(refreshToken: string, _id: string) {
    return await this.userModel.updateOne(
      {
        _id,
      },
      {
        refreshToken,
      },
    );
  }

  async checkRefreshTokenUser(refresh_token: string) {
    return await this.userModel.findOne({ refreshToken: refresh_token });
  }

  async register(registerUserDto: RegisterUserDto) {
    let existEmail = await this.userModel.findOne({
      email: registerUserDto.email,
    });
    if (existEmail) {
      throw new BadRequestException(`Email ${existEmail} is existed`);
    } else {
      const userRole = await this.roleModel.findOne({ name: 'NORMAL_USER' });
      let hashPassword = this.getHashPassword(registerUserDto.password);

      let user = await this.userModel.create({
        ...registerUserDto,
        role: userRole?._id,
        password: hashPassword,
      });

      return user;
    }
  }

  // create(createUserDto: CreateUserDto) {
  async create(createUserDto: CreateUserDto, currentUser: IUser) {
    let existEmail = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existEmail) {
      throw new BadRequestException(`Email ${existEmail} is existed`);
    }

    const hashPassword = this.getHashPassword(createUserDto.password);
    let user = await this.userModel.create({
      ...createUserDto,
      password: hashPassword,
      createdBy: {
        _id: currentUser._id,
        name: currentUser.name,
      },
    });
    return {
      _id: user._id,
      createAt: user.createdAt,
    };
  }

  IsCorrectPassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    console.log(filter);
    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 5;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate({ path: 'role', select: { _id: 1, name: 1 } })
      .select('-password')
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
      let user = await this.userModel
        .findById(id)
        .populate({ path: 'role', select: { _id: 1, name: 1 } });
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw new Error(`Failed to retrieve user: ${error.message}`);
    }
  }

  async findOneByEmail(email: string) {
    try {
      let user = (await this.userModel.findOne({ email: email })).populate({
        path: 'role',
        select: { name: 1 },
      });
      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error(`Failed to retrieve user: ${error.message}`);
    }
  }

  async update(updateUserDto: UpdateUserDto, currentUser: IUser) {
    try {
      return await this.userModel.updateOne(
        {
          _id: updateUserDto._id,
        },
        {
          ...updateUserDto,
          updatedBy: {
            _id: currentUser._id,
            name: currentUser.name,
          },
        },
      );
    } catch (error) {
      throw new Error(`Failed to retrieve user: ${error.message}`);
    }
  }

  async remove(id: string, currentUser: IUser) {
    const adminAcc = await this.userModel
      .findOne({ _id: id })
      .populate({ path: 'role', select: { name: 1 } })
      .exec();
    const userRole = adminAcc.role as unknown as { _id: string; name: string };
    if (userRole.name === ADMIN_ROLE) {
      throw new BadRequestException('Cannot remove admin user');
    }
    await this.userModel.updateOne(
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
    return await this.userModel.softDelete({ _id: id });
  }
}
