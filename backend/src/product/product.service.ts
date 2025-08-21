import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(paginationDto: PaginationDto): Promise<Product[]> {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    return this.prisma.product.findMany({
      skip,
      take: limit,
      include: {
        category: true,
      },
    });
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    return this.prisma.product.create({
      data: {
        title: createProductDto.title,
        description: createProductDto.description,
        price: createProductDto.price,
        image: createProductDto.imageUrl,
        categoryId: createProductDto.categoryId,
      },
      include: {
        category: true,
      },
    });
  }

  async findById(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    await this.findById(id);

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: true,
      },
    });
  }

  async deleteById(id: string): Promise<Product> {
    await this.findById(id);

    return this.prisma.product.delete({
      where: { id },
      include: {
        category: true,
      },
    });
  }
}
