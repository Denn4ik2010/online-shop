import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Response } from 'express';
import { AuthRequest } from '../types/request.type';
import { TokenService } from '../token/token.service';
import { Role } from '../enum/role.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
            logoutAll: jest.fn(),
            refreshToken: jest.fn(),
          },
        },
        { provide: TokenService, useValue: { verifyAccessToken: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('Should be defined', async () => {
    expect(controller).toBeDefined();
  });

  describe('Should register user', () => {
    const dto: CreateUserDto = {
      email: 'test@gmail.com',
      nickname: 'test',
      password: '12345',
    };
    const hashedPassword = 'hashedPassword';
    const mockUser = {
      id: 1,
      ...dto,
      password: hashedPassword,
      createdAt: new Date(),
      role: Role.USER,
    };
    it.each<[string, boolean]>([
      ['Should register user', true],
      ['Should throw an error if user already exists', false],
    ])('%s', async (_, isSuccess) => {
      if (isSuccess) {
        jest.spyOn(service, 'register').mockResolvedValue(mockUser);

        const user = await service.register(dto);

        expect(user).toEqual(mockUser);
        expect(service.register).toHaveBeenCalledWith(dto);
      } else {
        jest
          .spyOn(service, 'register')
          .mockRejectedValue(new BadRequestException('User already exists'));

        await expect(service.register(dto)).rejects.toThrow(
          BadRequestException,
        );
      }
    });
  });

  describe('Should login user', () => {
    const res: Partial<Response> = {
      cookie: jest.fn(),
      send: jest.fn(),
    };
    const dto: CreateUserDto = {
      email: 'test@gmail.com',
      nickname: 'test',
      password: '12345',
    };
    const mockTokens = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    };

    it.each<[string, boolean, boolean]>([
      ['Should login a user', true, false],
      ['Should throw NotFoundException because user not found', false, false],
      [
        'Should throw BadRequestException because email or password are incorrect',
        false,
        true,
      ],
    ])('%s', async (_, isSuccess, isUserFounded) => {
      if (isSuccess) {
        jest.spyOn(service, 'login').mockResolvedValue(mockTokens);

        await controller.login(dto, res as Response);

        expect(res.cookie).toHaveBeenCalledWith(
          'accessToken',
          mockTokens.accessToken,
          {
            httpOnly: true,
            maxAge: 60 * 60 * 1000,
          },
        );

        expect(res.cookie).toHaveBeenCalledWith(
          'refreshToken',
          mockTokens.refreshToken,
          {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
          },
        );
      } else if (!isUserFounded) {
        jest
          .spyOn(service, 'login')
          .mockRejectedValue(new NotFoundException('User not found'));
        await expect(controller.login(dto, res as Response)).rejects.toThrow(
          NotFoundException,
        );
      } else {
        jest
          .spyOn(service, 'login')
          .mockRejectedValue(new BadRequestException('User not found'));
        await expect(controller.login(dto, res as Response)).rejects.toThrow(
          BadRequestException,
        );
      }
    });
  });

  it('Should logout a user', async () => {
    const req: AuthRequest = {
      user: {
        id: 1,
        roles: ['USER'],
      },
      cookies: { refreshToken: 'refreshToken' },
    } as any;

    const res: Partial<Response> = {
      clearCookie: jest.fn(),
      send: jest.fn(),
    } as any;

    jest.spyOn(service, 'logout').mockResolvedValue({ count: 1 });

    await controller.logout(req, res as Response);

    expect(service.logout).toHaveBeenCalledWith(req.cookies.refreshToken);
    expect(res.clearCookie).toHaveBeenCalledWith('accessToken');
    expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
    expect(res.send).toHaveBeenCalledWith({ message: 'Logouted succesfully' });
  });

  it('Should logout all users', async () => {
    const req: AuthRequest = {
      user: {
        id: 1,
        roles: ['USER'],
      },
      cookies: { refreshToken: 'refreshToken' },
    } as any;

    const res: Partial<Response> = {
      clearCookie: jest.fn(),
      send: jest.fn(),
    } as any;

    jest.spyOn(service, 'logoutAll').mockResolvedValue({ count: 1 });

    await controller.logoutAll(req, res as Response);

    expect(service.logoutAll).toHaveBeenCalledWith(req.user.id);
    expect(res.clearCookie).toHaveBeenCalledWith('accessToken');
    expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
    expect(res.send).toHaveBeenCalledWith({
      message: 'Logouted in all devices',
    });
  });

  it('Should refresh tokens', async () => {
    const req: AuthRequest = {
      user: { id: 1, roles: ['USER'] },
      cookies: { refreshToken: 'refreshToken' },
    } as any;

    const res: Partial<Response> = { cookie: jest.fn(), send: jest.fn() };

    const mockTokens = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    };

    jest.spyOn(service, 'refreshToken').mockResolvedValue(mockTokens);

    await controller.refresh(req, res as any);

    expect(service.refreshToken).toHaveBeenCalledWith(req.cookies.refreshToken);
    expect(res.cookie).toHaveBeenCalledWith(
      'accessToken',
      mockTokens.accessToken,
      {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
      },
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      mockTokens.refreshToken,
      {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    );

    expect(res.send).toHaveBeenCalledWith({ message: 'Token refreshed' });
  });
});
