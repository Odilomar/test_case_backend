import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GithubService } from '../services/github/github.service';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { faker } from '@faker-js/faker';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NotFoundError } from 'rxjs';

const data = {
  avatar_url: 'https://github.com/images/error/octocat_happy.gif',
  name: 'monalisa octocat',
  email: 'octocat@github.com',
};

const expected = {
  ...data,
  id: faker.datatype.number(),
};

describe('UserService', () => {
  let service: UserService;
  let githubService: GithubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => 'auth'),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            save: jest.fn(() => expected),
            find: jest.fn(() => []),
            findOneBy: jest.fn(),
            delete: jest.fn(),
          },
        },
        GithubService,
        UserService,
      ],
    }).compile();

    githubService = module.get<GithubService>(GithubService);
    service = module.get<UserService>(UserService);

    jest
      .spyOn(githubService, 'getUserByUsername')
      .mockImplementation(async () => ({ status: 200, headers: {}, data }));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when creating a new user', () => {
    describe('when sending the correct username', () => {
      it('should save the user correctly', () =>
        expect(service.create({ username: 'test' })).resolves.toBe(expected));
    });

    describe('when receiving the profile without email', () => {
      beforeEach(() => {
        jest
          .spyOn(githubService, 'getUserByUsername')
          .mockImplementation(async () => ({
            status: 200,
            headers: {},
            data: { ...data, email: undefined },
          }));
      });

      it('should save the user correctly', () =>
        expect(
          service.create({ username: 'test', email: 'octocat@github.com' }),
        ).resolves.toBe(expected));

      it('should throw an error when there is no email', () =>
        expect(service.create({ username: 'test' })).rejects.toThrowError(
          new BadRequestException(
            "Your email address is not in your github profile page and it's not in the request. Try to create your user again with the email address in the body request!",
          ),
        ));
    });

    describe('when integration throws an error', () => {
      describe('when throws conflict error', () => {
        beforeEach(() => {
          jest
            .spyOn(service, 'findOneByEmail')
            .mockImplementation(async () => expected as unknown as User);
        });

        it('should throw the correct error', () =>
          expect(service.create({ username: 'test' })).rejects.toThrowError(
            new ConflictException('Your user is already created'),
          ));

        describe('when using the email in the body', () => {
          beforeEach(() => {
            jest
              .spyOn(githubService, 'getUserByUsername')
              .mockImplementation(async () => ({
                status: 200,
                headers: {},
                data: { ...data, email: undefined },
              }));
          });

          it('should throw the correct error', () =>
            expect(
              service.create({ username: 'test', email: 'teste@gmail.com' }),
            ).rejects.toThrowError(
              new ConflictException('Your user is already created'),
            ));
        });
      });
      describe('when throws not found error', () => {
        beforeEach(() => {
          jest
            .spyOn(githubService, 'getUserByUsername')
            .mockImplementation(async () => {
              throw new NotFoundException();
            });
        });

        it('should throw the correct error', () =>
          expect(service.create({ username: 'test' })).rejects.toThrowError(
            new NotFoundException(
              'User not found in the github api. Change your username and retry it!',
            ),
          ));
      });
      describe('when throws internal server error', () => {
        beforeEach(() => {
          jest
            .spyOn(githubService, 'getUserByUsername')
            .mockImplementation(async () => {
              throw new InternalServerErrorException();
            });
        });

        it('should throw the correct error', () =>
          expect(service.create({ username: 'test' })).rejects.toThrowError(
            new InternalServerErrorException(),
          ));
      });
    });
  });
});
