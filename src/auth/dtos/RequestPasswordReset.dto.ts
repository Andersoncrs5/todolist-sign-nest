import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";
import * as sanitizeHtml from "sanitize-html";

export class RequestPasswordResetDto {
  @IsEmail()
  @IsNotEmpty()
  @Length(1, 150, { message: "The max length of email is 150 and min is 1" })
  @IsEmail({}, { message: "The field email must be a valid email address" })
  @Transform(({ value }) => value.trim() )
  @Transform(({ value }) => value.toLowerCase() )
  @Transform(({ value }) => sanitizeHtml(value)) 
  @ApiProperty({ default: "user@example.com" })
  email: string;
}
