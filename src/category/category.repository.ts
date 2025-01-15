import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Category, Product } from '@prisma/client';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}
  async count(name?: string): Promise<number> {
    return await this.prisma.category.count({
      where: {
        name: name ? { contains: name, mode: 'insensitive' } : undefined,
      },
    });
  }

  async countProductsInCategory(categoryId: number): Promise<number> {
    return await this.prisma.category.count({
      where: {
        id: categoryId,
        products: {
          some: {},
        },
      },
    });
  }

  async findAll(skip: number, limit: number): Promise<Category[]> {
    return await this.prisma.category.findMany({ skip, take: limit });
  }

  async findOne(id: number): Promise<Category> {
    return await this.prisma.category.findUnique({ where: { id } });
  }

  async findByName(
    name: string,
    skip: number,
    limit: number,
  ): Promise<Category[]> {
    return await this.prisma.category.findMany({
      where: { name: { contains: name, mode: 'insensitive' } },
      skip,
      take: limit,
    });
  }

  async findCategoryProducts(
    id: number,
    skip: number,
    limit: number,
  ): Promise<Product[]> {
    const category = await this.prisma.category.findMany({
      where: { id },
      include: { products: true },
      skip,
      take: limit,
    });

    return category[0].products;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    return await this.prisma.category.create({ data: dto });
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    return await this.prisma.category.update({ where: { id }, data: dto });
  }

  async delete(id: number): Promise<Category> {
    return await this.prisma.category.delete({ where: { id } });
  }
}
