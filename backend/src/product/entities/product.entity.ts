export class Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  category?: any;
  orderItems?: any[];
  createdAt: Date;
}
