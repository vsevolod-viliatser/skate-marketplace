#!/usr/bin/env node

/**
 * 🧪 Complete Route Testing Script for Skate Marketplace
 *
 * This script tests all routes in your application with proper authentication
 * and realistic test data.
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001';
const TEST_DATA = {
  admin: {
    email: 'admin@skateshop.com',
    password: 'password123',
  },
  user: {
    email: 'user@skateshop.com',
    password: 'password123',
  },
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
};

// Helper function to log results
function logResult(testName, success, error = null, status = null) {
  if (success) {
    console.log(`✅ ${testName}`);
    testResults.passed++;
  } else {
    console.log(`❌ ${testName}`);
    testResults.failed++;
    if (error) {
      testResults.errors.push({
        test: testName,
        error: error.message || error,
        status,
      });
      console.log(`   Error: ${error.message || error}`);
      if (status) {
        console.log(`   Status: ${status}`);
      }
    }
  }
}

// Helper function to make authenticated requests
async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status,
    };
  }
}

// Test functions
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication Routes...');

  // Test admin login
  const adminLogin = await makeRequest('POST', '/auth/login', TEST_DATA.admin);
  if (adminLogin.success) {
    const adminToken = adminLogin.data.access_token;
    logResult('Admin Login', true);

    // Test get profile
    const profile = await makeRequest('GET', '/auth/profile', null, adminToken);
    logResult('Get Profile (Admin)', profile.success);

    return adminToken;
  } else {
    logResult('Admin Login', false, adminLogin.error);
    return null;
  }
}

async function testUserRoutes(adminToken) {
  console.log('\n👥 Testing User Routes...');

  if (!adminToken) {
    console.log('   Skipping user routes - no admin token');
    return null;
  }

  // Test get all users
  const allUsers = await makeRequest('GET', '/users', null, adminToken);
  logResult('Get All Users (Admin)', allUsers.success);

  // Test create user
  const timestamp = Date.now();
  const newUser = await makeRequest(
    'POST',
    '/users',
    {
      email: `testuser${timestamp}@example.com`,
      password: 'password123',
    },
    adminToken,
  );
  logResult(
    'Create User (Admin)',
    newUser.success,
    newUser.error,
    newUser.status,
  );

  let userId = null;
  if (newUser.success) {
    userId = newUser.data.id;

    // Test get user by ID
    const getUser = await makeRequest(
      'GET',
      `/users/${userId}`,
      null,
      adminToken,
    );
    logResult('Get User by ID', getUser.success);
  }

  return userId;
}

async function testCategoryRoutes(adminToken) {
  console.log('\n📂 Testing Category Routes...');

  if (!adminToken) {
    console.log('   Skipping category routes - no admin token');
    return null;
  }

  // Test get all categories
  const allCategories = await makeRequest(
    'GET',
    '/categories',
    null,
    adminToken,
  );
  logResult('Get All Categories', allCategories.success);

  let categoryId = null;
  if (allCategories.success && allCategories.data.length > 0) {
    categoryId = allCategories.data[0].id;

    // Test get category by ID
    const getCategory = await makeRequest(
      'GET',
      `/categories/${categoryId}`,
      null,
      adminToken,
    );
    logResult('Get Category by ID', getCategory.success);
  }

  // Test create category
  const timestamp = Date.now();
  const newCategory = await makeRequest(
    'POST',
    '/categories',
    {
      name: `Test Category ${timestamp}`,
    },
    adminToken,
  );
  logResult(
    'Create Category (Admin)',
    newCategory.success,
    newCategory.error,
    newCategory.status,
  );

  return categoryId;
}

async function testProductRoutes(adminToken, categoryId) {
  console.log('\n🛹 Testing Product Routes...');

  if (!adminToken) {
    console.log('   Skipping product routes - no admin token');
    return null;
  }

  // Test get all products
  const allProducts = await makeRequest(
    'GET',
    '/products?page=1&limit=5',
    null,
    adminToken,
  );
  logResult('Get All Products', allProducts.success);

  let productId = null;
  if (allProducts.success && allProducts.data.length > 0) {
    productId = allProducts.data[0].id;

    // Test get product by ID
    const getProduct = await makeRequest(
      'GET',
      `/products/${productId}`,
      null,
      adminToken,
    );
    logResult('Get Product by ID', getProduct.success);
  }

  // Test create product (if we have a category)
  if (categoryId) {
    const newProduct = await makeRequest(
      'POST',
      '/products',
      {
        title: 'Test Product',
        description: 'Test product for testing',
        price: 29.99,
        imageUrl: 'https://example.com/image.jpg',
        categoryId: categoryId,
      },
      adminToken,
    );
    logResult('Create Product (Admin)', newProduct.success);
  }

  return productId;
}

async function testOrderRoutes(adminToken, productId) {
  console.log('\n📦 Testing Order Routes...');

  if (!adminToken) {
    console.log('   Skipping order routes - no admin token');
    return null;
  }

  // Test get all orders
  const allOrders = await makeRequest('GET', '/orders', null, adminToken);
  logResult(
    'Get All Orders (Admin)',
    allOrders.success,
    allOrders.error,
    allOrders.status,
  );

  let orderId = null;
  if (allOrders.success && allOrders.data.length > 0) {
    orderId = allOrders.data[0].id;

    // Test get order by ID
    const getOrder = await makeRequest(
      'GET',
      `/orders/${orderId}`,
      null,
      adminToken,
    );
    logResult('Get Order by ID', getOrder.success);
  }

  // Test create order (if we have a product)
  if (productId) {
    const newOrder = await makeRequest(
      'POST',
      '/orders',
      {
        items: [
          {
            productId: productId,
            quantity: 2,
          },
        ],
      },
      adminToken,
    );
    logResult(
      'Create Order',
      newOrder.success,
      newOrder.error,
      newOrder.status,
    );
  }

  return orderId;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Complete Route Testing for Skate Marketplace...');
  console.log(`📍 Base URL: ${BASE_URL}`);

  try {
    // Test authentication first
    const adminToken = await testAuthentication();

    // Test all other routes
    const userId = await testUserRoutes(adminToken);
    const categoryId = await testCategoryRoutes(adminToken);
    const productId = await testProductRoutes(adminToken, categoryId);
    const orderId = await testOrderRoutes(adminToken, productId);

    // Print summary
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(
      `📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`,
    );

    if (testResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      testResults.errors.forEach((error) => {
        console.log(`   - ${error.test}: ${error.error}`);
      });
    }

    console.log('\n🎉 Testing completed!');
  } catch (error) {
    console.error('💥 Fatal error during testing:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testAuthentication,
  testUserRoutes,
  testCategoryRoutes,
  testProductRoutes,
  testOrderRoutes,
};
