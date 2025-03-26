import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Req,
  Res,
  Query,
  Patch,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { Response } from 'express';
import { RequieredRoles } from '../auth/decorator/requiered-roles.decorator';
import { AuthRequest } from '../types/request.type';
import {
  PaginatedUserNoCreds,
  UserNoPassword,
  UserNoCred,
} from './types/user.types';
import { PaginationDto } from '../dto/pagination.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { ValidateUserFilterPipe } from './pipe/validate-user-filter.pipe';
import { ProductService } from '../product/product.service';
import { PaginatedProduct } from '../product/types/product.types';
import { Role } from '../enum/role.enum';
import { SortUserDto } from './dto/sort-user.dto';
import { SortProductDto } from '../product/dto/sort-product.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly productService: ProductService,
  ) {}

  @Get()
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getAll(
    @Query() paginationDto: PaginationDto,
    @Query() sortDto: SortUserDto,
  ): Promise<PaginatedUserNoCreds> {
    return await this.userService.getAll(paginationDto, sortDto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req: AuthRequest): Promise<UserNoPassword> {
    return await this.userService.getMe(req.user.id);
  }

  @Get('search')
  async search(
    @Query(ValidateUserFilterPipe) dto: SearchUserDto,
    @Query() pagination: PaginationDto,
    @Query() sortDto: SortUserDto,
  ): Promise<PaginatedUserNoCreds> {
    return await this.userService.search(dto, pagination, sortDto);
  }

  @Get(':userId')
  @UseGuards(AuthGuard)
  async getById(@Param('userId') userId: number): Promise<UserNoCred | void> {
    return await this.userService.getById(userId);
  }

  @Get(':userId/products')
  async getUserProducts(
    @Param('userId') userId: number,
    @Query() paginationDto: PaginationDto,
    @Query() sortDto: SortProductDto,
  ): Promise<PaginatedProduct> {
    return await this.productService.getUserProducts(userId, paginationDto, sortDto);
  }

  // Привоїти користувачу роль адміна
  @Patch('assing-admin/:userId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async assignAdmin(@Param('userId') userId: number): Promise<UserNoCred> {
    return await this.userService.assignAdmin(userId);
  }

  // Маршрут для видалення акаунту власиником цього акаунту
  @Delete('me')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async deleteMe(@Req() req: AuthRequest, @Res() res: Response): Promise<void> {
    await this.userService.delete(req.user.id);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.sendStatus(204);
  }

  // Видалення акаунту адміністратором
  @Delete(':userId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(204)
  async delete(@Param('userId') userId: number): Promise<void> {
    return await this.userService.delete(userId);
  }
}
