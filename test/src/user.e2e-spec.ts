import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import configuration from '../../src/config/configuration';
import { ClearDatabaseService } from '../../src/services/clear-database/clear-database.service';
import { GithubService } from '../../src/services/github/github.service';
import { ServicesModule } from '../../src/services/services.module';
import { UserModule } from '../../src/user/user.module';

const data = {
  name: 'Deleted user',
  avatar_url: 'https://avatars.githubusercontent.com/u/10137?v=4',
  email: 'ghost@gmail.com',
  username: 'ghost',
};

const expected = {
  ...data,
  avatar: data.avatar_url,
  avatar_url: undefined,
  id: 1,
};

describe('Users', () => {
  let app: INestApplication;
  let clearDatabaseService: ClearDatabaseService;

  const makeRequest = () => request(app.getHttpServer());

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => {
            return {
              type: 'postgres',
              host: configService.get('postgres.test.host'),
              port: configService.get('postgres.test.port'),
              username: configService.get('postgres.test.user'),
              password: configService.get('postgres.test.pass'),
              database: configService.get('postgres.test.db'),
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
    })
      .overrideProvider(GithubService)
      .useValue({
        getUserByUsername: jest.fn(() => ({ data })),
      })
      .compile();

    app = module.createNestApplication();
    await app.init();

    clearDatabaseService =
      module.get<ClearDatabaseService>(ClearDatabaseService);
    await clearDatabaseService.cleanDatabase();
  });

  afterAll(async () => {
    await clearDatabaseService.cleanDatabase();
    await app.close();
  });

  describe('/POST users', () => {
    let createUser;

    beforeAll(() => {
      createUser = makeRequest().post('/users').send(expected);
    });

    it('returns the correct status code', () =>
      createUser.expect(HttpStatus.CREATED));
    it('returns the correct data', () => createUser.expect(expected));
  });

  describe('/GET users', () => {
    let getUsers;

    beforeAll(() => {
      getUsers = makeRequest().get('/users');
    });

    it('returns the correct status code', () => getUsers.expect(HttpStatus.OK));
    it('returns the correct data', () => getUsers.expect([expected]));
  });

  describe('/GET users/:id', () => {
    let getUser;

    beforeAll(() => {
      getUser = makeRequest().get(`/users/${expected.id}`);
    });

    it('returns the correct status code', () => getUser.expect(HttpStatus.OK));
    it('returns the correct data', () => getUser.expect(expected));
  });

  describe('/PUT users/:id', () => {
    let updateUser;

    beforeAll(async () => {
      updateUser = makeRequest().put(`/users/${expected.id}`).send(expected);
    });

    it('returns the correct status code', () =>
      updateUser.expect(HttpStatus.OK));
    it('returns the correct data', () => updateUser.expect(expected));
  });

  describe('/DELETE users/:id', () => {
    let deleteUser;

    beforeAll(() => {
      deleteUser = makeRequest().delete(`/users/${expected.id}`);
    });

    it('returns the correct status code', () =>
      deleteUser.expect(HttpStatus.NO_CONTENT));
  });
});
