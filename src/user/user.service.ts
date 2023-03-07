import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GithubService } from '../services/github/github.service';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import {
  EMAIL_REQUIRED,
  USER_ALREADY_CREATED,
  USER_NOT_FOUND,
  USER_NOT_FOUND_IN_GITHUB,
} from '../utils/errors';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private githubService: GithubService,
  ) {}

  async create({ username, email }: CreateUserDto) {
    try {
      const response = await this.githubService.getUserByUsername(username);
      const { data: profile } = response;

      if (!profile.email && !email) {
        throw new BadRequestException(EMAIL_REQUIRED);
      }

      const user = await this.findOneByEmail(profile.email || email);

      if (!!user) {
        throw new ConflictException(USER_ALREADY_CREATED);
      }

      return this.usersRepository.save({
        name: profile.name,
        avatar: profile.avatar_url,
        email: profile.email || email,
      });
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw new NotFoundException(USER_NOT_FOUND_IN_GITHUB);
      }

      throw error;
    }
  }

  findAll(options?: FindManyOptions<User>): Promise<User[]> {
    return this.usersRepository.find(options);
  }

  findOneById(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  findOneByEmail(email: string): Promise<User> {
    return this.usersRepository.findOneBy({ email });
  }

  async update({ id, ...info }: UpdateUserDto): Promise<User> {
    console.log('on update');
    const user = await this.findOneById(id);

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    return this.usersRepository.save({ ...user, ...info });
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOneById(id);

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    await this.usersRepository.delete(id);
  }
}
