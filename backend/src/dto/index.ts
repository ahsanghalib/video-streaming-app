import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
} from "class-validator";
import { UserTypesEnum } from "../types";

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class RegisterDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(6)
  confirm_password: string;

  @IsBoolean()
  is_active: boolean = true;

  @IsEnum(UserTypesEnum)
  user_type: UserTypesEnum = UserTypesEnum.USER;
}
