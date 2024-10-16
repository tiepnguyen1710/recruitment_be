import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({timestamps : true})
export class User {
  @Prop({required: true})
  email: string;

  @Prop({required: true})
  password: string;

  @Prop()
  name: string;

  @Prop()
  phone: string;

  @Prop()
  age: number;

  @Prop()
  address: string;

  @Prop()
  gender: string;

  @Prop()
  role: string;

  @Prop()
  refreshToken: string;

  @Prop({type: Object})
  company : {
    _id : mongoose.Schema.Types.ObjectId,
    name : string
  }

  @Prop({type: Object})
  createdBy: {
    _id : mongoose.Schema.Types.ObjectId,
    name : string
  }

  @Prop({type: Object})
  updatedBy: {
    _id : mongoose.Schema.Types.ObjectId,
    name : string
  }

  @Prop({type: Object})
  deletedBy: {
    _id : mongoose.Schema.Types.ObjectId,
    name : string
  }

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  isDelete: Boolean;

  @Prop()
  deleteAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
