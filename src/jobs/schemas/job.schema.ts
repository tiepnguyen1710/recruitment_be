import { Prop } from "@nestjs/mongoose"
import mongoose from "mongoose";

export class Job {
    @Prop()
    name: string;

    @Prop()
    skills: string[];

    @Prop({type : Object})
    company: {
        _id : mongoose.Schema.Types.ObjectId,
        name : string
    }

    @Prop()
    location: string;

    @Prop()
    salary: number;

    @Prop()
    quantity: number;

    @Prop()
    level: string;

    @Prop()
    description : string;

    @Prop()
    startDate: Date;

    @Prop()
    endDate: Date;
    
    @Prop()
    isActive: boolean;
}
