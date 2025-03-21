import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import Role from '../enum/role.enum';

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

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should assing new admin', async () => {
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

  it('should find all users without filters', async () => {
    const mockUsers = [
      {
        id: 1,
        email: 'test@example.com',
        nickname: 'test',
        createdAt: new Date(),

        products: [
          {
            id: 1,
            userId: 1,
            description: 'Product description',
            title: 'Product title',
            price: 100,
            images: ['image1.jpg', 'image2.jpg'],
          },
        ],
        role: Role.USER,
      },
    ];

    jest.spyOn(repository, 'count').mockResolvedValue(1);
    jest.spyOn(repository, 'findAll').mockResolvedValue(mockUsers);

    const users = await service.getAll({ page: 1, pageSize: 10 });

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
  });

  it('should return all users searched by nickname', async () => {
    const mockUsers = [
      {
        id: 1,
        email: 'test',
        nickname: 'test',
        createdAt: new Date(),

        password: 'password',
        products: [
          {
            id: 1,
            userId: 1,
            description: 'Product description',
            title: 'Product title',
            price: 100,
            images: ['image1.jpg', 'image2.jpg'],
          },
        ],
        role: Role.USER,
      },
    ];

    jest.spyOn(repository, 'count').mockResolvedValue(1);
    jest.spyOn(repository, 'findUsers').mockResolvedValue(mockUsers);

    const users = await service.search(
      { nickname: 'test' },
      { page: 1, pageSize: 10 },
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
  });

  it('should return all users searched by nickname and date range', async () => {
    const mockUsers = [
      {
        id: 1,
        email: 'test',
        nickname: 'test',
        createdAt: new Date(),

        password: 'password',
        products: [
          {
            id: 1,
            userId: 1,
            description: 'Product description',
            title: 'Product title',
            price: 100,
            images: ['image1.jpg', 'image2.jpg'],
          },
        ],
        role: Role.USER,
      },
    ];

    jest.spyOn(repository, 'count').mockResolvedValue(1);
    jest.spyOn(repository, 'findUsers').mockResolvedValue(mockUsers);

    const users = await service.search(
      { nickname: 'test', minDate: new Date(), maxDate: new Date() },
      { page: 1, pageSize: 10 },
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
  });

  it('should find user by id with email', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      nickname: 'test',
      createdAt: new Date(),
      products: [
        {
          id: 1,
          userId: 1,
          description: 'Product description',
          title: 'Product title',
          price: 100,
          images: ['image1.jpg', 'image2.jpg'],
        },
      ],
      role: Role.USER,
    };

    jest.spyOn(repository, 'findById').mockResolvedValue(mockUser);

    const user = await service.getById(1);
    expect(user).toEqual(mockUser);
  });

  it('should find user profile', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      nickname: 'test',
      createdAt: new Date(),
      products: [
        {
          id: 1,
          userId: 1,
          description: 'Product description',
          title: 'Product title',
          price: 100,
          images: ['image1.jpg', 'image2.jpg'],
        },
      ],
      role: Role.USER,
    };

    jest.spyOn(repository, 'findUserProfile').mockResolvedValue(mockUser);

    const user = await service.getMe(1);
    expect(user).toEqual(mockUser);
  });

  it('should throw NotFoundException if user not found by id', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(null);

    await expect(service.getById(1)).rejects.toThrow(NotFoundException);
    expect(repository.findById).toHaveBeenCalledWith(1);
  });

  it('should find user by email', async () => {
    const email = 'test@example.com';
    const mockUser = {
      id: 1,
      email,
      password: 'password',
      nickname: 'test',
      createdAt: new Date(),

      products: [
        {
          id: 1,
          userId: 1,
          description: 'Product description',
          title: 'Product title',
          price: 100,
          images: ['image1.jpg', 'image2.jpg'],
        },
      ],
      role: Role.USER,
    };
    jest.spyOn(repository, 'findOneByEmail').mockResolvedValue(mockUser);

    const user = await service.getByEmail(email);

    expect(user).toEqual(mockUser);
  });

  it('should create a new user', async () => {
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

      products: null,
      role: Role.USER,
    };

    jest.spyOn(repository, 'create').mockResolvedValue(mockUser);

    const user = await service.create(dto);

    expect(user).toEqual(mockUser);
    expect(repository.create).toHaveBeenCalledWith(
      dto.email,
      dto.nickname,
      dto.password,
    );
  });

  it('should delete a user by id', async () => {
    await service.delete(1);

    expect(repository.delete).toHaveBeenCalledWith(1);
  });
});
