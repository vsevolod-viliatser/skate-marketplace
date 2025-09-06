import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type {
  PaginatedProducts,
  ProductSearchOptions,
  ProductWithCategory,
} from './product.service';
import { ProductService } from './product.service';
@Controller('products')
@UseGuards(JwtAuthGuard, RoleGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() searchOptions?: ProductSearchOptions,
  ): Promise<PaginatedProducts> {
    return this.productService.findAll(paginationDto, searchOptions || {});
  }

  @Post()
  @Roles('ADMIN')
  create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductWithCategory> {
    return this.productService.createProduct(createProductDto);
  }

  @Get(':id')
  findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductWithCategory> {
    return this.productService.findById(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductWithCategory> {
    return this.productService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  deleteById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductWithCategory> {
    return this.productService.deleteById(id);
  }

  @Get('stock/low')
  @Roles('ADMIN')
  findLowStock(
    @Query('threshold') threshold?: number,
  ): Promise<ProductWithCategory[]> {
    return this.productService.findLowStockProducts(threshold);
  }

  @Put(':id/stock')
  @Roles('ADMIN')
  updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('quantity') quantity: number,
  ): Promise<ProductWithCategory> {
    return this.productService.updateStock(id, quantity);
  }
}
