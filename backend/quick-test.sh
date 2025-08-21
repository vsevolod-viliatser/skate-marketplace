#!/bin/bash

# 🚀 Quick Test Script for Skate Marketplace
# This script sets up and runs all route tests

echo "🚀 Starting Skate Marketplace Route Testing..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ Error: pnpm is not installed. Please install it first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Please create one based on env.example"
    echo "   Copy env.example to .env and update the values"
    read -p "   Press Enter to continue anyway..."
fi

echo "📦 Installing dependencies..."
pnpm install

echo "🌱 Seeding database..."
pnpm run seed

echo "🚀 Starting application in background..."
pnpm run start:dev &
APP_PID=$!

# Wait for app to start
echo "⏳ Waiting for application to start..."
sleep 10

# Check if app is running
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Application is running on http://localhost:3001"
else
    echo "❌ Application failed to start. Check the logs above."
    kill $APP_PID 2>/dev/null
    exit 1
fi

echo "🧪 Running route tests..."
pnpm run test:routes

echo "🛑 Stopping application..."
kill $APP_PID 2>/dev/null

echo "🎉 Testing completed! Check the results above."
echo ""
echo "💡 Tips:"
echo "   - Use 'pnpm run test:routes' to run tests again"
echo "   - Use 'pnpm run start:dev' to start the app manually"
echo "   - Check TESTING.md for detailed testing information" 