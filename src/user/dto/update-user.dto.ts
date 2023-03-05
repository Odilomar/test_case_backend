import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUserDto {
  id: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    description: "The user's name",
  })
  name: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  @ApiProperty({
    type: String,
    description: "The user's avatar url",
  })
  avatar: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  @ApiPropertyOptional({
    type: String,
    description: "The user's email",
  })
  email?: string;
}
