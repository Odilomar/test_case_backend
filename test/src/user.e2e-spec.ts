import { faker } from '@faker-js/faker';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { UserService } from '../../src/user/user.service';

const data = {
  avatar: 'https://github.com/images/error/octocat_happy.gif',
  name: 'monalisa octocat',
  email: 'octocat@github.com',
};

const expected = {
  ...data,
  id: faker.datatype.number(),
};

describe('Users', () => {
  let app: INestApplication;
  let userService: UserService;

  const makeRequest = () => request(app.getHttpServer());

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UserService)
      .useValue({
        create: jest.fn(() => expected),
        update: jest.fn(() => expected),
        findAll: jest.fn(() => [expected]),
        findOneById: jest.fn(() => expected),
        findOneByEmail: jest.fn(() => expected),
        remove: jest.fn(),
      })
      .compile();

    app = module.createNestApplication();
    await app.init();

    userService = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/GET users', () => {
    let getUsers;

    beforeEach(() => {
      getUsers = makeRequest().get('/users');
    });

    it('returns the correct status code', () => getUsers.expect(HttpStatus.OK));
    it('returns the correct data', () => getUsers.expect([expected]));
  });

  describe('/GET users/:id', () => {
    let getUser;

    beforeEach(() => {
      getUser = makeRequest().get('/users/123');
    });

    it('returns the correct status code', () => getUser.expect(HttpStatus.OK));
    it('returns the correct data', () => getUser.expect(expected));
  });

  describe('/DELETE users/:id', () => {
    let deleteUser;

    beforeEach(() => {
      deleteUser = makeRequest().delete('/users/123');
    });

    it('returns the correct status code', () =>
      deleteUser.expect(HttpStatus.NO_CONTENT));
  });

  describe('/PUT users/:id', () => {
    let updateUser;

    beforeEach(() => {
      updateUser = makeRequest().put('/users/123').send(expected);
    });

    it('returns the correct status code', () =>
      updateUser.expect(HttpStatus.OK));
    it('returns the correct data', () => updateUser.expect(expected));
  });

  describe('/POST users', () => {
    let createUser;

    beforeEach(() => {
      createUser = makeRequest().post('/users').send(expected);
    });

    it('returns the correct status code', () =>
      createUser.expect(HttpStatus.CREATED));
    it('returns the correct data', () => createUser.expect(expected));
  });
});
