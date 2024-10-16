import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateCompanyDto {
    @IsNotEmpty({message: "Name cannot be blank"})
    name : string;
    
    @IsNotEmpty({message: "Address cannot be blank"})
    address : string;

    @IsNotEmpty({message: "Description cannot be blank"})
    description : string;
    
}

