import { IsEmail, IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateResumeDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  userId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  url: string;

  @IsNotEmpty()
  status: string;

  @IsNotEmpty()
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  jobId: mongoose.Schema.Types.ObjectId;
}

export class CreateCVDto {
  @IsNotEmpty()
  url: string;

  @IsNotEmpty()
  @IsMongoId()
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  jobId: mongoose.Schema.Types.ObjectId;
}
