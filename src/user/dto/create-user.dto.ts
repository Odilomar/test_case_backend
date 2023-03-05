import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description:
      'The username is required to get your information to from github',
  })
  username: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  @ApiPropertyOptional({
    type: String,
    description:
      'The email is requested when email is not available in the github profile page',
  })
  email?: string;
}
