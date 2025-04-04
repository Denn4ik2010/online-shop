import { Product, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from './user.repository';
import { TestingModule, Test } from '@nestjs/testing';
import { Role } from '../enum/role.enum';
import { Order } from '../enum/order.enum';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserRepository', () => {
  const date = new Date();

  let repository: UserRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: {
            user: {
              count: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(repository).toBeDefined();
  });

  it('should assing new admin', async () => {
    const mockUsers = {
      id: 1,
      nickname: 'test',
      createdAt: date,
      role: Role.USER,
    };

    jest
      .spyOn(prismaService.user, 'update')
      .mockResolvedValue(mockUsers as any);

    const user = await repository.assignAdmin(1);

    expect(user).toEqual(mockUsers);
  });

  it('should count all users without filters', async () => {
    jest.spyOn(prismaService.user, 'count').mockResolvedValue(10);

    const result = await repository.count();

    expect(result).toBe(10);
    expect(prismaService.user.count).toHaveBeenCalledWith({
      where: {
        createdAt: {
          gte: undefined,
          lte: undefined,
        },
        nickname: {
          contains: undefined,
          mode: 'insensitive',
        },
      },
    });
  });

  it('should count users filtered by nickname', async () => {
    jest.spyOn(prismaService.user, 'count').mockResolvedValue(5);

    const result = await repository.count({ nickname: 'John' });
    expect(result).toBe(5);
    expect(prismaService.user.count).toHaveBeenCalledWith({
      where: {
        nickname: { contains: 'John', mode: 'insensitive' },
        createdAt: { lte: undefined, gte: undefined },
      },
    });
  });

  it('should count users filtered by nickname and min date', async () => {
    jest.spyOn(prismaService.user, 'count').mockResolvedValue(3);

    const result = await repository.count({
      nickname: 'test',
      minDate: date,
    });
    expect(result).toBe(3);
    expect(prismaService.user.count).toHaveBeenCalledWith({
      where: {
        nickname: {
          contains: 'test',
          mode: 'insensitive',
        },
        createdAt: {
          gte: date,
        },
      },
    });
  });

  it('should count users filtered by nickname and max date', async () => {
    jest.spyOn(prismaService.user, 'count').mockResolvedValue(3);

    const result = await repository.count({
      nickname: 'test',
      maxDate: date,
    });
    expect(result).toBe(3);
    expect(prismaService.user.count).toHaveBeenCalledWith({
      where: {
        nickname: {
          contains: 'test',
          mode: 'insensitive',
        },
        createdAt: {
          lte: date,
        },
      },
    });
  });

  it('should count users filtered by nickname and date range', async () => {
    jest.spyOn(prismaService.user, 'count').mockResolvedValue(2);

    const result = await repository.count({
      nickname: 'test',
      minDate: date,
      maxDate: date,
    });

    expect(result).toBe(2);
    expect(prismaService.user.count).toHaveBeenCalledWith({
      where: {
        nickname: { contains: 'test', mode: 'insensitive' },
        createdAt: {
          gte: date,
          lte: date,
        },
      },
    });
  });

  it('should get all users with default sorting', async () => {
    const mockUsers = [
      {
        id: 1,
        email: 'email',
        nickname: 'test',
        password: 'test',
        createdAt: date,

        role: Role.USER,
      },
    ];

    jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

    const users = await repository.findAll(0, 10, {
      sortBy: 'id',
      order: Order.DESC,
    });

    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        nickname: true,
        createdAt: true,
        role: true,
      },
      skip: 0,
      take: 10,
      orderBy: {
        id: 'desc',
      },
    });

    expect(users).toEqual(mockUsers);
  });

  it('should search user by nickname with default sorting', async () => {
    const mockUsers = [
      {
        id: 1,
        email: 'email',
        nickname: 'test',
        password: 'password',
        createdAt: date,
        products: [{} as Product],
        role: Role.USER,
      },
    ];

    jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

    const users = await repository.findUsers({ nickname: 'test' }, 0, 10, {
      sortBy: 'id',
      order: Order.DESC,
    });

    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      where: {
        nickname: { contains: 'test', mode: 'insensitive' },
        createdAt: {
          gte: undefined,
          lte: undefined,
        },
      },

      select: {
        id: true,
        nickname: true,
        createdAt: true,

        role: true,
      },
      skip: 0,
      take: 10,
      orderBy: {
        id: 'desc',
      },
    });

    expect(users).toEqual(mockUsers);
  });

  it('should search user by nickname and min date with default sorting', async () => {
    const mockUsers = [
      {
        id: 1,
        email: 'email',
        nickname: 'test',
        createdAt: date,
        password: 'password',
        products: [{} as Product],
        role: Role.USER,
      },
    ];

    jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

    const users = await repository.findUsers(
      {
        nickname: 'test',
        minDate: date,
      },
      0,
      10,
      { sortBy: 'id', order: Order.DESC },
    );

    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      where: {
        nickname: { contains: 'test', mode: 'insensitive' },
        createdAt: {
          gte: date,
        },
      },

      select: {
        id: true,
        nickname: true,
        createdAt: true,
        role: true,
      },
      skip: 0,
      take: 10,
      orderBy: {
        id: 'desc',
      },
    });

    expect(users).toEqual(mockUsers);
  });

  it('should search user by nickname and max date with default sorting', async () => {
    const mockUsers = [
      {
        id: 1,
        email: 'email',
        nickname: 'test',
        createdAt: date,
        password: 'password',
        products: [{} as Product],
        role: Role.USER,
      },
    ];

    jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

    const users = await repository.findUsers(
      {
        nickname: 'test',
        maxDate: date,
      },
      0,
      10,
      { sortBy: 'id', order: Order.DESC },
    );

    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      where: {
        nickname: { contains: 'test', mode: 'insensitive' },
        createdAt: {
          lte: date,
        },
      },

      select: {
        id: true,
        nickname: true,
        createdAt: true,
        role: true,
      },
      skip: 0,
      take: 10,
      orderBy: {
        id: 'desc',
      },
    });

    expect(users).toEqual(mockUsers);
  });

  it('should search user by nickname and date range with default sorting', async () => {
    const mockUsers = [
      {
        id: 1,
        email: 'email',
        nickname: 'test',
        createdAt: date,
        password: 'password',
        products: [{} as Product],
        role: Role.USER,
      },
    ];

    jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

    const users = await repository.findUsers(
      {
        nickname: 'test',
        minDate: date,
        maxDate: date,
      },
      0,
      10,
      { sortBy: 'id', order: Order.DESC },
    );

    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      where: {
        nickname: { contains: 'test', mode: 'insensitive' },
        createdAt: {
          gte: date,
          lte: date,
        },
      },

      select: {
        id: true,
        nickname: true,
        createdAt: true,

        role: true,
      },
      skip: 0,
      take: 10,
      orderBy: {
        id: 'desc',
      },
    });

    expect(users).toEqual(mockUsers);
  });

  it('should find user by id', async () => {
    const userId = 1;
    const mockUser = {
      id: userId,
      email: 'email',
      products: [{}],
      role: Role.USER,
    };

    jest
      .spyOn(prismaService.user, 'findUnique')
      .mockResolvedValue(mockUser as any);

    const user = await repository.findById(userId);

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        createdAt: true,
        role: true,
      },
    });

    expect(user).toEqual(mockUser);
  });

  it('should find user profile', async () => {
    const userId = 1;
    const mockUser = {
      id: userId,
      email: 'email',
      products: [{}],
      role: Role.USER,
    };

    jest
      .spyOn(prismaService.user, 'findUnique')
      .mockResolvedValue(mockUser as any);

    const user = await repository.findUserProfile(userId);

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        email: true,
        createdAt: true,
        role: true,
      },
    });

    expect(user).toEqual(mockUser);
  });

  it('should find user by email', async () => {
    const email = 'email';
    const mockUser = {
      id: 1,
      email,
      nickname: 'test',
      password: 'test',
      createdAt: date,
      products: [{}],
      role: Role.USER,
    };

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

    const user = await repository.findOneByEmail(email);

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email },
    });

    expect(user).toEqual(mockUser);
  });

  it('should create a new user', async () => {
    const createUserDto: CreateUserDto = {
      email: 'email',
      nickname: 'nick',
      password: '1234',
    };

    jest
      .spyOn(prismaService.user, 'create')
      .mockResolvedValue(createUserDto as User);

    const user = await repository.create(createUserDto);

    expect(prismaService.user.create).toHaveBeenCalledWith({
      data: createUserDto,
      select: {
        id: true,
        email: true,
        nickname: true,
        createdAt: true,
        role: true,
      },
    });

    expect(user).toEqual(createUserDto);
  });

  it('should delete user by id', async () => {
    const mockUser = {
      id: 1,
      nickname: 'nick',
      email: 'user@example.com',
      password: '1234',
      role: Role.USER,
      createdAt: date,
    };

    jest.spyOn(prismaService.user, 'delete').mockResolvedValue(mockUser);

    await repository.delete(1);

    expect(prismaService.user.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });
});
