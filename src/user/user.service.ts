import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { RoleService } from '../role/role.service';
import { Product, Role } from '@prisma/client';
import {
  UserRoles,
  UserRolesNoPassword,
  UserRolesNoCreds,
  PaginatedUserRolesNoCreds,
} from './types/user.types';
import { PaginationDto } from '../dto/pagination.dto';
import { SearchUserDto } from './dto/search-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleService: RoleService,
  ) {}

  async getAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedUserRolesNoCreds> {
    const { page, pageSize }: PaginationDto = paginationDto;
    const skip: number = pageSize * (page - 1);

    const users = await this.userRepository.findAll(skip, pageSize);
    const total = await this.userRepository.count();

    const totalPages: number = Math.ceil(total / pageSize);

    return {
      users,
      total,
      page,
      pageSize,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    };
  }

  async search(
    dto: SearchUserDto,
    pagination: PaginationDto,
  ): Promise<PaginatedUserRolesNoCreds> {
    const { page, pageSize }: PaginationDto = pagination;
    const skip: number = pageSize * (page - 1);

    const users: UserRolesNoCreds[] = await this.userRepository.findUsers(
      dto,
      skip,
      pageSize,
    );

    const total: number = await this.userRepository.count(dto);
    const totalPages: number = Math.ceil(total / pageSize);

    return {
      users,
      total,
      page,
      pageSize,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    };
  }

  async getById(userId: number): Promise<UserRolesNoCreds> {
    const user: UserRolesNoCreds | null =
      await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getMe(userId: number): Promise<UserRolesNoPassword> {
    return await this.userRepository.findUserProfile(userId);
  }

  async getByEmail(email: string): Promise<UserRoles | null> {
    return await this.userRepository.findOneByEmail(email);
  }

  async create(dto: CreateUserDto): Promise<UserRolesNoPassword> {
    const userRole: Role = await this.roleService.getRoleByValue('USER');

    return await this.userRepository.create(
      dto.email,
      dto.nickname,
      dto.password,
      userRole.id,
    );
  }

  async delete(userId: number): Promise<void> {
    try {
      return await this.userRepository.delete(userId);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException('User not found');
      }
    }
  }

  async assignAdmin(userId: number): Promise<UserRolesNoCreds> {
    const candidate: UserRolesNoCreds =
      await this.userRepository.findById(userId);

    if (!candidate) {
      throw new NotFoundException('User not found');
    }

    try {
      return await this.userRepository.assignAdmin(userId);
    } catch (e: unknown) {
      if (e instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException('User already has admin role');
      }
    }
  }
}
