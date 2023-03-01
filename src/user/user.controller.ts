import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  async getUsers(): Promise<User[]> {
    try {
      return this.userService.findAll();
    } catch (err) {
      throw new HttpException(err, err.statusCode);
    }
  }

  @Get('/:id')
  async getUserById(@Param('id') id: number): Promise<User> {
    try {
      return this.userService.findOne(id);
    } catch (err) {
      throw new HttpException(err, err.statusCode);
    }
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserById(@Param('id') id: number): Promise<void> {
    try {
      await this.userService.remove(id);
    } catch (err) {
      throw new HttpException(err, err.statusCode);
    }
  }
}
