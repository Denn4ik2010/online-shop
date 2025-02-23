import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Req,
  Param,
  Query,
  Body,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProductDto } from './dto/update-product.dto';
import { ImagesInterceptor } from './interceptor/images.interceptor';
import { AuthRequest } from '../types/request.type';
import { Product } from '@prisma/client';
import { PaginationDto } from '../dto/pagination.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { ParseProductDtoPipe } from './pipe/parse-product-filter.pipe';
import { PaginatedProducts } from './types/product.types';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('')
  async getAllProducts(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedProducts> {
    return await this.productService.findAll(paginationDto);
  }

  @Get('search')
  async searchProducts(
    @Query(ParseProductDtoPipe) dto: SearchProductDto,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedProducts> {
    return await this.productService.searchProducts(dto, pagination);
  }

  @Get(':productId')
  async getProductById(
    @Param('productId') productId: number,
  ): Promise<Product> {
    return await this.productService.findById(productId);
  }

  @Post('')
  @UseGuards(AuthGuard)
  @UseInterceptors(ImagesInterceptor())
  async createProduct(
    @Req() req: AuthRequest,
    @Body() dto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<Product> {
    return await this.productService.create(req.user.id, dto, images);
  }

  @Patch(':productId')
  @UseGuards(AuthGuard)
  @UseInterceptors(ImagesInterceptor())
  async updateProduct(
    @Req() req: AuthRequest,
    @Body() dto: UpdateProductDto,
    @Param('productId') productId: number,
    @UploadedFiles() images?: Express.Multer.File[],
  ): Promise<Product> {
    return await this.productService.updateProduct(
      req.user.id,
      productId,
      dto,
      images,
    );
  }

  @Delete(':productId')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async deleteProduct(
    @Req() req: AuthRequest,
    @Param('productId') productId: number,
  ): Promise<void> {
    await this.productService.deleteProduct(req.user.id, productId);
    return;
  }
}
