import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested } from "class-validator";
import mongoose from "mongoose";

class Company{
    @IsNotEmpty()
    _id : mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;
}

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email : string;
    
    @IsNotEmpty()
    password : string;

    @IsNotEmpty()
    name : string;

    @IsNotEmpty()
    address : string

    @IsNotEmpty()
    age : number;

    @IsNotEmpty()
    gender: string;

    @IsNotEmpty()
    role : string;

    
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company!: Company;
}

export class RegisterUserDto {
    @IsEmail()
    @IsNotEmpty()
    email : string;
    
    @IsNotEmpty()
    password : string;

    @IsNotEmpty()
    name : string;

    @IsNotEmpty()
    address : string;

    @IsNotEmpty()
    age : number;

    @IsNotEmpty()
    gender: string;

}
