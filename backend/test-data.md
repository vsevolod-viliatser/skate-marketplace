# 🧪 **Test Data for Manual Testing**

## 🔑 **Test Users**

### **Admin User**

```json
{
  "email": "admin@skateshop.com",
  "password": "password123"
}
```

### **Regular User**

```json
{
  "email": "user@skateshop.com",
  "password": "password123"
}
```

## 🛹 **Test Products**

### **Create Product 1**

```json
{
  "title": "Pro Skateboard Deck",
  "description": "High-quality 8.0\" skateboard deck made from 7-ply maple",
  "price": 59.99,
  "imageUrl": "https://images.unsplash.com/photo-1572776685600-cf276d3c3b32?w=400",
  "categoryId": "DECKS_CATEGORY_ID"
}
```

### **Create Product 2**

```json
{
  "title": "Aluminum Skateboard Trucks",
  "description": "Lightweight aluminum trucks with perfect turning radius",
  "price": 45.99,
  "imageUrl": "https://images.unsplash.com/photo-1572776685600-cf276d3c3b32?w=400",
  "categoryId": "TRUCKS_CATEGORY_ID"
}
```

### **Create Product 3**

```json
{
  "title": "High-Speed Bearings",
  "description": "ABEC-7 rated bearings for maximum speed and durability",
  "price": 19.99,
  "imageUrl": "https://images.unsplash.com/photo-1572776685600-cf276d3c3b32?w=400",
  "categoryId": "BEARINGS_CATEGORY_ID"
}
```

## 🚀 **API Endpoints to Test**

### **Authentication**

```bash
# Register new user
POST /auth/register
{
  "email": "newuser@example.com",
  "password": "password123"
}

# Login
POST /auth/login
{
  "email": "newuser@example.com",
  "password": "password123"
}
```

### **Users**

```bash
# Get all users
GET /users

# Create user
POST /users
{
  "email": "test@example.com",
  "password": "password123"
}
```

### **Products**

```bash
# Get all products
GET /products

# Create product
POST /products
{
  "title": "Test Product",
  "description": "Test Description",
  "price": 29.99,
  "imageUrl": "https://example.com/image.jpg",
  "categoryId": "CATEGORY_ID_HERE"
}
```

## 📝 **Testing Steps**

### **1. Seed Database**

```bash
pnpm run seed
```

### **2. Test Authentication**

- Register new user
- Login with credentials
- Copy JWT token

### **3. Test Protected Routes**

- Add JWT token to Authorization header
- Test protected endpoints

### **4. Test CRUD Operations**

- Create products
- Get all products
- Create users
- Get all users

## 🔧 **Common Issues & Solutions**

### **Missing Category ID**

- Run seed script first to create categories
- Use category IDs from seed output

### **JWT Token Issues**

- Check token expiration (1 hour)
- Ensure proper Authorization header format: `Bearer <token>`

### **Database Connection**

- Ensure PostgreSQL is running
- Check DATABASE_URL in .env file
