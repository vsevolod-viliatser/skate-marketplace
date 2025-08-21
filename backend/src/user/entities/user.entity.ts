export class User {
  id: string;
  email: string;
  password: string;
  role: string;
  orders?: any[];
  createdAt: Date;
}
