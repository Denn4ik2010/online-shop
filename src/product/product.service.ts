import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductRepository } from './product.repository';
import { Product } from '@prisma/client';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileService } from '../file/file.service';
import { ProductFilter } from './interface/product-filter.interface';
import { PaginationDto } from 'src/dto/pagination.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly fileService: FileService,
  ) {}

  private async validateProductOwnership(
    userId: number,
    productId: number,
  ): Promise<Product> {
    const product: Product | null =
      await this.productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.userId !== userId) {
      throw new ForbiddenException();
    }

    return product;
  }

  async findAll(filter: ProductFilter, paginationDto: PaginationDto) {
    let { pageSize, page }: PaginationDto = paginationDto;

    const skip: number = (page - 1) * pageSize;

    const products: Product[] = await this.productRepository.findAll(
      filter,
      skip,
      pageSize,
    );

    const total: number = await this.productRepository.count(filter);
    const totalPages: number = Math.ceil(total / pageSize);

    return {
      products,
      total,
      pageSize,
      page,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    };
  }

  async findById(productId: number): Promise<Product> {
    const product: Product | null =
      await this.productRepository.findById(productId);

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  async create(
    userId: number,
    dto: CreateProductDto,
    images: Express.Multer.File[],
  ): Promise<Product> {
    const imagesNames: string[] = await this.fileService.createImages(images);

    return await this.productRepository.create(userId, dto, imagesNames);
  }

  async updateProduct(
    userId: number,
    productId: number,
    dto: UpdateProductDto,
    images?: Express.Multer.File[],
  ): Promise<Product> {
    await this.validateProductOwnership(userId, productId);

    let imagesNames: string[] = [];

    if (images && images.length > 0) {
      imagesNames = await this.fileService.createImages(images);
    } else {
      imagesNames = [];
    }

    return await this.productRepository.update(productId, dto, imagesNames);
  }

  async deleteProduct(userId: number, productId: number): Promise<Product> {
    await this.validateProductOwnership(userId, productId);

    return await this.productRepository.delete(productId);
  }
}
