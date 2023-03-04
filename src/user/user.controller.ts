import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Created Succesfully' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiConflictResponse({ description: 'Conflicted Request' })
  @ApiNotFoundResponse({ description: 'Not Found Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async createUser(@Body() body: CreateUserDto): Promise<User> {
    try {
      return this.userService.create(body);
    } catch (err) {
      throw new HttpException(err, err.statusCode);
    }
  }

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
      return this.userService.findOneById(id);
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
