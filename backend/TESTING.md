# 🧪 **Complete Route Testing Guide**

This guide will help you test all routes in your Skate Marketplace application with proper authentication and realistic data.

## 🚀 **Quick Start**

### 1. **Setup Database**

```bash
# Seed the database with test data
pnpm run seed
```

### 2. **Start Application**

```bash
# Start in development mode
pnpm run start:dev
```

### 3. **Run Automated Tests**

```bash
# Run all route tests
pnpm run test:routes

# Run tests in watch mode (requires nodemon)
pnpm run test:routes:watch
```

## 📋 **Available Routes to Test**

### **Authentication Routes** (`/auth`)

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile (protected)

### **User Routes** (`/users`)

- `GET /users` - Get all users (Admin only)
- `POST /users` - Create new user (Admin only)
- `GET /users/:id` - Get user by ID
- `DELETE /users/:id` - Delete user (Admin only)

### **Product Routes** (`/products`)

- `GET /products` - Get all products (with pagination)
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product (Admin only)
- `PUT /products/:id` - Update product (Admin only)
- `DELETE /products/:id` - Delete product (Admin only)

### **Category Routes** (`/categories`)

- `GET /categories` - Get all categories
- `GET /categories/:id` - Get category by ID
- `POST /categories` - Create category (Admin only)
- `PUT /categories/:id` - Update category (Admin only)
- `DELETE /categories/:id` - Delete category (Admin only)

### **Order Routes** (`/orders`)

- `GET /orders` - Get all orders (Admin only)
- `GET /orders/my-orders` - Get user's own orders
- `GET /orders/:id` - Get order by ID
- `POST /orders` - Create new order
- `PUT /orders/:id/status` - Update order status (Admin only)
- `PUT /orders/:id` - Update order

## 🔑 **Test Credentials**

The seed script creates these test users:

### **Admin User**

- Email: `admin@skateshop.com`
- Password: `password123`
- Role: `ADMIN`

### **Regular Users**

- Email: `user@skateshop.com`
- Password: `password123`
- Role: `USER`

- Email: `john@skateshop.com`
- Password: `password123`
- Role: `USER`

## 🧪 **Testing Methods**

### **Method 1: Automated Testing Script**

```bash
pnpm run test:routes
```

This runs a comprehensive test suite that:

- Tests authentication
- Tests all CRUD operations
- Validates proper authorization
- Reports success/failure rates

### **Method 2: HTTP Client (VS Code REST Client)**

Use the `test-routes.http` file in VS Code with the REST Client extension:

1. Install REST Client extension
2. Open `test-routes.http`
3. Click "Send Request" above each endpoint
4. Set environment variables for tokens and IDs

### **Method 3: Manual Testing with curl**

```bash
# Login and get token
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@skateshop.com","password":"password123"}'

# Use token for protected routes
curl -X GET http://localhost:3001/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### **Method 4: Postman/Insomnia**

Import the endpoints from `test-routes.http` and set up:

- Environment variables for tokens
- Collection variables for IDs
- Pre-request scripts for authentication

## 📊 **Test Data Structure**

### **Create User**

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### **Create Product**

```json
{
  "title": "Test Product",
  "description": "Test Description",
  "price": 29.99,
  "imageUrl": "https://example.com/image.jpg",
  "categoryId": "UUID_FROM_CATEGORY"
}
```

### **Create Category**

```json
{
  "name": "Test Category",
  "description": "Test category description",
  "imageUrl": "https://example.com/image.jpg"
}
```

### **Create Order**

```json
{
  "items": [
    {
      "productId": "UUID_FROM_PRODUCT",
      "quantity": 2
    }
  ]
}
```

## 🔍 **Testing Scenarios**

### **Authentication Flow**

1. Register new user
2. Login with credentials
3. Access protected routes with token
4. Verify token expiration

### **Authorization Testing**

1. Test admin-only routes with admin token
2. Test admin-only routes with user token (should fail)
3. Test user routes with valid token
4. Test routes without token (should fail)

### **Data Validation**

1. Test with valid data (should succeed)
2. Test with invalid data (should fail with 400)
3. Test with missing required fields
4. Test with invalid UUIDs

### **Error Handling**

1. Test with non-existent IDs (should return 404)
2. Test with invalid UUIDs (should return 400)
3. Test with expired tokens (should return 401)
4. Test with insufficient permissions (should return 403)

## 🚨 **Common Issues & Solutions**

### **Database Connection**

```bash
# If database is not running
pnpm run seed
```

### **Port Already in Use**

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### **JWT Token Issues**

- Check if JWT_SECRET is set in environment
- Verify token expiration (default: 1 hour)
- Ensure proper Authorization header format

### **Validation Errors**

- Check DTO validation rules
- Ensure all required fields are provided
- Verify data types (string, number, UUID)

## 📈 **Performance Testing**

### **Load Testing with Artillery**

```bash
# Install artillery
npm install -g artillery

# Run load test
artillery run load-test.yml
```

### **Stress Testing**

```bash
# Test with multiple concurrent requests
pnpm run test:routes:stress
```

## 🎯 **Testing Best Practices**

1. **Always test with fresh data** - Use `pnpm run seed` before testing
2. **Test both positive and negative cases** - Valid and invalid data
3. **Verify authorization** - Test admin vs user permissions
4. **Check response formats** - Ensure consistent API responses
5. **Test edge cases** - Empty arrays, null values, boundary conditions
6. **Monitor performance** - Response times, memory usage
7. **Log test results** - Keep track of what works and what doesn't

## 🔧 **Customizing Tests**

### **Add New Test Cases**

Edit `test-routes.js` to add:

- New endpoint tests
- Custom validation tests
- Performance benchmarks
- Integration tests

### **Modify Test Data**

Update the test data in the script or create new seed data in `prisma/seed.ts`

### **Environment Variables**

Set these in your `.env` file:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
PORT=3001
```

## 📞 **Need Help?**

If you encounter issues:

1. Check the console logs for error messages
2. Verify database connection and schema
3. Ensure all dependencies are installed
4. Check environment variables
5. Review the test data structure

Happy testing! 🎉
