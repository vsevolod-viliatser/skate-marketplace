import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { LoggerService } from '../common/services/logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

export interface ProductWithCategory extends Product {
  category: {
    id: string;
    name: string;
    description?: string | null;
  };
}

export interface ProductSearchOptions {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isActive?: boolean;
}

export interface PaginatedProducts {
  data: ProductWithCategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ProductService {
  protected readonly modelName = 'product';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async findAll(
    paginationDto: PaginationDto,
    searchOptions: ProductSearchOptions = {},
  ): Promise<PaginatedProducts> {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const {
      categoryId,
      minPrice,
      maxPrice,
      search,
      isActive = true,
    } = searchOptions;

    // Build where clause
    const where: any = { isActive };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    this.logger.debug(
      `Finding products with pagination: page=${page}, limit=${limit}, filters=${JSON.stringify(searchOptions)}`,
      'ProductService',
    );

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async createProduct(
    createProductDto: CreateProductDto,
  ): Promise<ProductWithCategory> {
    this.logger.debug('Creating new product', 'ProductService');

    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with ID ${createProductDto.categoryId} not found`,
      );
    }

    return this.prisma.product.create({
      data: {
        title: createProductDto.title,
        description: createProductDto.description,
        price: createProductDto.price,
        images: createProductDto.imageUrl ? [createProductDto.imageUrl] : [],
        categoryId: createProductDto.categoryId,
        brand: createProductDto.brand,
        sku: createProductDto.sku,
        stockQuantity: createProductDto.stockQuantity || 0,
        tags: createProductDto.tags || [],
        weight: createProductDto.weight,
        dimensions: createProductDto.dimensions,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<ProductWithCategory> {
    this.logger.debug(`Finding product by ID: ${id}`, 'ProductService');

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        variants: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      const message = `Product with ID ${id} not found`;
      this.logger.warn(message, 'ProductService');
      throw new NotFoundException(message);
    }

    return product;
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductWithCategory> {
    await this.findById(id); // Ensure product exists

    this.logger.debug(`Updating product with ID: ${id}`, 'ProductService');

    // If categoryId is being updated, verify it exists
    if (updateProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${updateProductDto.categoryId} not found`,
        );
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
  }

  async deleteById(id: string): Promise<ProductWithCategory> {
    await this.findById(id); // Ensure product exists

    this.logger.debug(`Deleting product with ID: ${id}`, 'ProductService');

    return this.prisma.product.delete({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
  }

  async updateStock(
    id: string,
    quantity: number,
  ): Promise<ProductWithCategory> {
    this.logger.debug(
      `Updating stock for product ${id}: ${quantity}`,
      'ProductService',
    );

    return this.prisma.product.update({
      where: { id },
      data: { stockQuantity: quantity },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
  }

  async findLowStockProducts(
    threshold: number = 5,
  ): Promise<ProductWithCategory[]> {
    this.logger.debug('Finding low stock products', 'ProductService');

    return this.prisma.product.findMany({
      where: {
        isActive: true,
        stockQuantity: { lte: threshold },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: { stockQuantity: 'asc' },
    });
  }
}
