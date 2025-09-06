import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService } from './logger.service';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FindManyOptions {
  skip?: number;
  take?: number;
  where?: any;
  include?: any;
  orderBy?: any;
}

export interface FindManyResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export abstract class BaseService<T extends BaseEntity> {
  protected abstract modelName: string;

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly logger: LoggerService,
  ) {}

  protected get model(): any {
    return (this.prisma as any)[this.modelName];
  }

  async findById(id: string, include?: any): Promise<T> {
    this.logger.debug(
      `Finding ${this.modelName} by ID: ${id}`,
      this.constructor.name,
    );

    const entity = await this.model.findUnique({
      where: { id },
      ...(include && { include }),
    });

    if (!entity) {
      const message = `${this.modelName} with ID ${id} not found`;
      this.logger.warn(message, this.constructor.name);
      throw new NotFoundException(message);
    }

    return entity;
  }

  async findMany(options: FindManyOptions = {}): Promise<FindManyResult<T>> {
    const { skip = 0, take = 20, where, include, orderBy } = options;

    this.logger.debug(
      `Finding ${this.modelName} with options: ${JSON.stringify(options)}`,
      this.constructor.name,
    );

    const [data, total] = await Promise.all([
      this.model.findMany({
        skip,
        take,
        where,
        include,
        orderBy,
      }),
      this.model.count({ where }),
    ]);

    const page = Math.floor(skip / take) + 1;
    const totalPages = Math.ceil(total / take);

    return {
      data,
      total,
      page,
      limit: take,
      totalPages,
    };
  }

  async create(data: any, include?: any): Promise<T> {
    this.logger.debug(`Creating ${this.modelName}`, this.constructor.name);

    return await this.model.create({
      data,
      ...(include && { include }),
    });
  }

  async update(id: string, data: any, include?: any): Promise<T> {
    await this.findById(id); // Ensure entity exists

    this.logger.debug(
      `Updating ${this.modelName} with ID: ${id}`,
      this.constructor.name,
    );

    return this.model.update({
      where: { id },
      data,
      ...(include && { include }),
    });
  }

  async delete(id: string): Promise<T> {
    await this.findById(id); // Ensure entity exists

    this.logger.debug(
      `Deleting ${this.modelName} with ID: ${id}`,
      this.constructor.name,
    );

    return this.model.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.model.count({
      where: { id },
    });
    return count > 0;
  }
}
