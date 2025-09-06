import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { CommonModule } from './common/common.module';
import { OrderModule } from './order/order.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    PrismaModule,
    CommonModule,
    UserModule,
    ProductModule,
    AuthModule,
    OrderModule,
    CategoriesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
