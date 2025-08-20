export class CreateProductDto {
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
}
