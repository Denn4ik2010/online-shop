import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../enum/role.enum';
import { Order } from '../enum/order.enum';
import { SearchUserDto } from './dto/search-user.dto';
import { UserNoCred } from './types/user.types';

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            assignAdmin: jest.fn(),
            count: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findUsers: jest.fn(),
            findUserProducts: jest.fn(),
            findUserProfile: jest.fn(),
            findOneByEmail: jest.fn(),
            findUserRoles: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('Should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('Should assing new admin', async () => {
    const mockUser = {
      id: 1,
      nickname: 'test',
      createdAt: new Date(),
      role: Role.USER,
    };

    jest.spyOn(repository, 'findById').mockResolvedValue(mockUser);
    jest.spyOn(repository, 'assignAdmin').mockResolvedValue(mockUser);

    const user = await service.assignAdmin(1);

    expect(user).toEqual(mockUser);
  });

  it('Should find all users without filters with default sorting', async () => {
    const mockUsers = [
      {
        id: 1,
        email: 'test@example.com',
        nickname: 'test',
        createdAt: new Date(),
        role: Role.USER,
      },
    ];

    jest.spyOn(repository, 'count').mockResolvedValue(1);
    jest.spyOn(repository, 'findAll').mockResolvedValue(mockUsers);

    const users = await service.getAll(
      { page: 1, pageSize: 10 },
      { sortBy: 'id', order: Order.DESC },
    );

    expect(users).toEqual({
      users: mockUsers,
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      nextPage: null,
      prevPage: null,
    });
    expect(repository.findAll).toHaveBeenCalled();
    expect(repository.count).toHaveBeenCalled();
  });

  describe('Should search users with filters wtih default sorting', () => {
    const mockUsers = [
      {
        id: 1,
        nickname: 'test',
        createdAt: new Date(),
        role: Role.USER,
      },
    ];
    jest.spyOn(repository, 'count').mockResolvedValue(1);
    jest.spyOn(repository, 'findUsers').mockResolvedValue(mockUsers);

    it.each<[string, SearchUserDto]>([
      [
        'Should return all users searched by nickname with default sorting',
        { nickname: 'test' },
      ],
      [
        'Should return all users searched by nickname and minDate with default sorting',
        { nickname: 'test', minDate: new Date() },
      ],
      [
        'Should return all users searched by nickname and maxDate with default sorting',
        { nickname: 'test', maxDate: new Date() },
      ],
      [
        'Should return all users searched by nickname and date range with default sorting',
        { nickname: 'test', minDate: new Date(), maxDate: new Date() },
      ],
    ])('%s', async (_, searchUserDto) => {
      const users = await service.search(
        searchUserDto,
        {
          page: 1,
          pageSize: 10,
        },
        { sortBy: 'id', order: Order.DESC },
      );

      expect(users).toEqual({
        users: mockUsers,
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        nextPage: null,
        prevPage: null,
      });

      expect(repository.findUsers).toHaveBeenCalledWith(searchUserDto, 0, 10, {
        sortBy: 'id',
        order: Order.DESC,
      });
      expect(repository.count).toHaveBeenCalledWith(searchUserDto);
    });
  });

  it('Should find user by email', async () => {
    const email = 'test@example.com';
    const mockUser = {
      id: 1,
      email,
      password: 'password',
      nickname: 'test',
      createdAt: new Date(),
      role: Role.USER,
    };
    jest.spyOn(repository, 'findOneByEmail').mockResolvedValue(mockUser);

    const user = await service.getByEmail(email);

    expect(user).toEqual(mockUser);
  });

  describe('Should find user by id', () => {
    it.each<[string, UserNoCred | null]>([
      [
        'Should find user by id',
        { id: 1, nickname: 'test', createdAt: new Date(), role: Role.USER },
      ],
      ['Should throw NotFoundException because user not found', null],
    ])('%s', async (_, mockUser) => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockUser);

      if (mockUser) {
        const user = await service.getById(mockUser.id);

        expect(user).toEqual(mockUser);
        expect(repository.findById).toHaveBeenCalledWith(mockUser.id);
      } else {
        await expect(service.getById(1)).rejects.toThrow(NotFoundException);
        expect(repository.findById).toHaveBeenCalledWith(1);
      }
    });
  });

  it('Should find user profile', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      nickname: 'test',
      createdAt: new Date(),
      role: Role.USER,
    };

    jest.spyOn(repository, 'findUserProfile').mockResolvedValue(mockUser);

    const user = await service.getMe(1);
    expect(user).toEqual(mockUser);
  });

  it('Should create a new user', async () => {
    const dto: CreateUserDto = {
      email: 'test@test.com',
      nickname: 'test',
      password: 'password',
    };
    const mockUser = {
      id: 1,
      email: 'test',
      nickname: 'test',
      createdAt: new Date(),
      role: Role.USER,
    };

    jest.spyOn(repository, 'create').mockResolvedValue(mockUser);

    const user = await service.create(dto);

    expect(user).toEqual(mockUser);
    expect(repository.create).toHaveBeenCalledWith(dto);
  });

  it('Should delete a user by id', async () => {
    await service.delete(1);

    expect(repository.delete).toHaveBeenCalledWith(1);
  });
});
