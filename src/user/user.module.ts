import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ServicesModule } from 'src/services/services.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ServicesModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
