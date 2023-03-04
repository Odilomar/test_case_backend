import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GithubService } from '../services/github/github.service';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

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
        throw new BadRequestException(
          "Your email address is not in your github profile page and it's not in the request. Try to create your user again with the email address in the body request!",
        );
      }

      const user = await this.findOneByEmail(profile.email || email);

      if (!!user) {
        throw new ConflictException('Your user is already created');
      }

      return this.usersRepository.save({
        name: profile.name,
        avatar: profile.avatar_url,
        email: profile.email || email,
      });
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(
          'User not found in the github api. Change your username and retry it!',
        );
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

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
