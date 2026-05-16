# Server Dockerfile - Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install ALL dependencies (including Prisma binaries)
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma/

# Generate prisma client
RUN npx prisma generate

# Copy scripts folder
COPY scripts ./scripts/

# Run the createPrismaDefault script to build client.js and default.js
RUN node scripts/createPrismaDefault.js

# Copy source code
COPY . .

# Build
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy scripts folder (needed for postinstall)
COPY --from=builder /app/scripts ./scripts/

# Install production dependencies (skip postinstall, will copy generated files from builder)
RUN npm ci --only=production --ignore-scripts

# Copy prisma schema and generated client from builder (including compiled JS files)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built files
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/server.cjs"]
