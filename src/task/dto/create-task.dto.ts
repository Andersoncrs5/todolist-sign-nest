import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsNotEmpty, IsString, Length, IsOptional } from "class-validator";
import * as sanitizeHtml from "sanitize-html";

export class CreateTaskDto {

    @IsString({ message: "The field title should be a string" })
    @IsNotEmpty({ message: "The field title cannot be null" })
    @Length(1, 150, { message: "The max length of title is 150 and min is 1" })
    @Transform(({ value }) => sanitizeHtml(value)) 
    title: string

    @IsString({ message: "The field description should be a string" })
    @IsNotEmpty({ message: "The field description cannot be null" })
    @Length(1, 300, { message: "The max length of description is 150 and min is 1" })
    @Transform(({ value }) => sanitizeHtml(value)) 
    description: string

    @IsBoolean()
    @IsOptional()
    done: boolean 
}
