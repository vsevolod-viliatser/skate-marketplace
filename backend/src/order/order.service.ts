import { Injectable, NotFoundException } from '@nestjs/common';
import { Order } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Order[]> {
    return this.prisma.order.findMany({
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async create(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
    const { items } = createOrderDto;

    // Calculate order totals
    const orderItems = await Promise.all(
      items.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) {
          throw new NotFoundException(
            `Product with ID ${item.productId} not found`,
          );
        }
        const unitPrice = product.price;
        const totalPrice = unitPrice * item.quantity;
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
        };
      }),
    );

    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const orderNumber = `ORD-${Date.now()}`;

    return this.prisma.order.create({
      data: {
        userId,
        status: 'PENDING',
        orderNumber,
        subtotal,
        totalAmount: subtotal,
        items: {
          create: orderItems,
        },
      },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async updateStatus(
    id: string,
    status:
      | 'PENDING'
      | 'CONFIRMED'
      | 'PROCESSING'
      | 'SHIPPED'
      | 'DELIVERED'
      | 'CANCELED'
      | 'REFUNDED',
  ): Promise<Order> {
    await this.findById(id);

    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    await this.findById(id);

    const { items, ...updateData } = updateOrderDto;

    if (items) {
      // Delete existing items and create new ones
      await this.prisma.orderItem.deleteMany({
        where: { orderId: id },
      });

      // Calculate order totals for updated items
      const orderItems = await Promise.all(
        items.map(async (item) => {
          const product = await this.prisma.product.findUnique({
            where: { id: item.productId },
          });
          if (!product) {
            throw new NotFoundException(
              `Product with ID ${item.productId} not found`,
            );
          }
          const unitPrice = product.price;
          const totalPrice = unitPrice * item.quantity;
          return {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice,
            totalPrice,
          };
        }),
      );

      const subtotal = orderItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0,
      );

      return this.prisma.order.update({
        where: { id },
        data: {
          ...updateData,
          subtotal,
          totalAmount: subtotal,
          items: {
            create: orderItems,
          },
        },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    return this.prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }
}
