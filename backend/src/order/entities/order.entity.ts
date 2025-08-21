export class Order {
  id: string;
  userId: string;
  status: string;
  user?: any;
  items?: any[];
  createdAt: Date;
}

export class OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  order?: any;
  product?: any;
}
