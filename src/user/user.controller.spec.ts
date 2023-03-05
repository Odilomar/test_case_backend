import { faker } from '@faker-js/faker';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GithubService } from '../services/github/github.service';
import {
  EMAIL_REQUIRED,
  USER_ALREADY_CREATED,
  USER_NOT_FOUND,
  USER_NOT_FOUND_IN_GITHUB,
} from '../utils/errors';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const data = {
  avatar: 'https://github.com/images/error/octocat_happy.gif',
  name: 'monalisa octocat',
  email: 'octocat@github.com',
};

const expected = {
  ...data,
  id: faker.datatype.number(),
};

describe('UserController', () => {
  let controller: UserController;
  let githubService: GithubService;
  let userRepository: Repository<User>;

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
      controllers: [UserController],
    }).compile();

    controller = module.get<UserController>(UserController);
    githubService = module.get<GithubService>(GithubService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    jest
      .spyOn(githubService, 'getUserByUsername')
      .mockImplementation(async () => ({ status: 200, headers: {}, data }));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('when creating a new user', () => {
    describe('when sending the correct username', () => {
      it('should save the user correctly', () =>
        expect(controller.createUser({ username: 'test' })).resolves.toBe(
          expected,
        ));
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
          controller.createUser({
            username: 'test',
            email: 'octocat@github.com',
          }),
        ).resolves.toBe(expected));

      it('should throw an error when there is no email', () =>
        expect(
          controller.createUser({ username: 'test' }),
        ).rejects.toThrowError(new BadRequestException(EMAIL_REQUIRED)));
    });

    describe('when integration throws an error', () => {
      describe('when throws conflict error', () => {
        beforeEach(() => {
          jest
            .spyOn(userRepository, 'findOneBy')
            .mockImplementation(async () => expected as unknown as User);
        });

        it('should throw the correct error', () =>
          expect(
            controller.createUser({ username: 'test' }),
          ).rejects.toThrowError(new ConflictException(USER_ALREADY_CREATED)));

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
              controller.createUser({
                username: 'test',
                email: 'teste@gmail.com',
              }),
            ).rejects.toThrowError(
              new ConflictException(USER_ALREADY_CREATED),
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
          expect(
            controller.createUser({ username: 'test' }),
          ).rejects.toThrowError(
            new NotFoundException(USER_NOT_FOUND_IN_GITHUB),
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
          expect(
            controller.createUser({ username: 'test' }),
          ).rejects.toThrowError(new InternalServerErrorException()));
      });
    });
  });

  describe('when removing a user', () => {
    describe('when user is removed', () => {
      beforeEach(() => {
        jest
          .spyOn(userRepository, 'findOneBy')
          .mockImplementation(async () => expected as unknown as User);
        return controller.deleteUserById(123);
      });
      it('calls the delete method', () =>
        expect(userRepository.delete).toBeCalledWith(123));
    });

    describe('when no user is founded', () => {
      it('should throw not found error', () =>
        expect(controller.deleteUserById(123)).rejects.toThrowError(
          new NotFoundException(USER_NOT_FOUND),
        ));
    });
  });

  describe('when updating a user', () => {
    describe('when user is updated', () => {
      beforeEach(() => {
        jest
          .spyOn(userRepository, 'findOneBy')
          .mockImplementation(async () => expected as unknown as User);
      });
      it('returns the correct data', () =>
        expect(
          controller.updateUser(expected.id, expected),
        ).resolves.toStrictEqual(expected));
    });

    describe('when no user is founded', () => {
      it('should throw not found error', () =>
        expect(
          controller.updateUser(expected.id, expected),
        ).rejects.toThrowError(new NotFoundException(USER_NOT_FOUND)));
    });
  });
  describe('when finding a user', () => {
    describe('when using findOneBy method', () => {
      beforeEach(() => {
        jest
          .spyOn(userRepository, 'findOneBy')
          .mockImplementation(async () => expected as unknown as User);
      });

      describe('when finding a user by id', () => {
        it('should returns the user', () =>
          expect(controller.getUserById(expected.id)).resolves.toBe(expected));
      });
    });

    describe('when using find method', () => {
      beforeEach(() => {
        jest
          .spyOn(userRepository, 'find')
          .mockImplementation(async () => [expected as unknown as User]);
      });

      describe('when using no filters', () => {
        it('returs the correct data', () =>
          expect(controller.getUsers()).resolves.toStrictEqual([expected]));
      });

      describe('when filtering by name', () => {
        it('returs the correct data', () =>
          expect(controller.getUsers()).resolves.toStrictEqual([expected]));
      });
    });
  });
});
