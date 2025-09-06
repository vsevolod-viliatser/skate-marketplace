import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Order } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderService } from './order.service';

@Controller('orders')
@UseGuards(JwtAuthGuard, RoleGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @Roles('ADMIN')
  findAll(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  @Get('my-orders')
  findMyOrders(@Request() req: { user: { id: string } }): Promise<Order[]> {
    return this.orderService.findByUserId(req.user.id);
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return this.orderService.findById(id);
  }

  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req: { user: { id: string } },
  ): Promise<Order> {
    return this.orderService.create(createOrderDto, req.user.id);
  }

  @Put(':id/status')
  @Roles('ADMIN')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status')
    status:
      | 'PENDING'
      | 'CONFIRMED'
      | 'PROCESSING'
      | 'SHIPPED'
      | 'DELIVERED'
      | 'CANCELED'
      | 'REFUNDED',
  ): Promise<Order> {
    return this.orderService.updateStatus(id, status);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    return this.orderService.update(id, updateOrderDto);
  }
}
