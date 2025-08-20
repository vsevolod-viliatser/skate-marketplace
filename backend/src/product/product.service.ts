import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
      },
    });
  }
  createProduct(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        title: createProductDto.title,
        description: createProductDto.description,
        price: createProductDto.price,
        image: createProductDto.imageUrl,
        categoryId: createProductDto.categoryId,
      },
    });
  }
}
