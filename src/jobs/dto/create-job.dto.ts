import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';

class Company {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  logo: string;
}

export class CreateJobDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company!: Company;

  @IsNotEmpty()
  location: string;

  @IsNotEmpty()
  salary: number;

  @IsNotEmpty()
  quantity: number;

  @IsNotEmpty()
  level: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @IsNotEmpty()
  @IsDateString()
  endDate: Date;

  @IsNotEmpty()
  isActive: boolean;
}
