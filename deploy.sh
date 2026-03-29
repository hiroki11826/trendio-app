#!/bin/bash
# EC2 Deployment Script for SNS Insight

set -e

echo "=== SNS Insight EC2 Deployment ==="

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "Error: .env.production file not found!"
    echo "Copy .env.production.example to .env.production and fill in your values"
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

# Stop existing containers
echo "Stopping existing containers..."
docker compose -f docker-compose.prod.yml down || true

# Build and start containers
echo "Building and starting containers..."
docker compose -f docker-compose.prod.yml up -d --build

# Wait for database to be ready
echo "Waiting for database..."
sleep 10

# Run database migrations
echo "Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T server npx prisma migrate deploy

echo ""
echo "=== Deployment Complete ==="
echo "Frontend: http://localhost (or your domain)"
echo "API: http://localhost/api"
echo ""
echo "Check logs: docker compose -f docker-compose.prod.yml logs -f"
