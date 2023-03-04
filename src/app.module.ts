import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { ServicesModule } from './services/services.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get('postgres.host'),
          port: configService.get('postgres.port'),
          username: configService.get('postgres.user'),
          password: configService.get('postgres.pass'),
          database: configService.get('postgres.db'),
          synchronize: configService.get('typeorm.synchronize'),
          logging: configService.get('typeorm.logging'),
          logger: configService.get('typeorm.logger'),
          autoLoadEntities: true,
        };
      },
      inject: [ConfigService],
    }),
    UserModule,
    ServicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
