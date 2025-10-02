import { IsEmail, IsNumber, IsString, MaxLength, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class Post {
  @IsString()
  @MaxLength(10)
  title: string;

  @IsString()
  @MaxLength(100)
  content: string;
}

export class UserValidator {
  @IsString()
  name: string;

  @IsNumber()
  age: number;

  @IsString()
  @IsEmail()
  email: string;

  @ValidateNested()
  @Type(() => Post)
  post: Post;
}
