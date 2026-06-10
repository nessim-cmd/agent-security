# Phase 01 — Project Initialization

> **Status:** Ready to execute
> **Depends on:** Nothing
> **Done when:** `docker compose up` starts all containers healthy. `pnpm dev` boots web and backend with no errors.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Monorepo Root Setup](#2-monorepo-root-setup)
3. [Shared TypeScript Config](#3-shared-typescript-config)
4. [Shared ESLint + Prettier Config](#4-shared-eslint--prettier-config)
5. [packages/core — Shared Types](#5-packagescore--shared-types)
6. [Backend — NestJS Scaffold](#6-backend--nestjs-scaffold)
7. [apps/web — Next.js 15 Scaffold](#7-appsweb--nextjs-15-scaffold)
8. [apps/admin — Next.js 15 Scaffold](#8-appsadmin--nextjs-15-scaffold)
9. [Docker Compose — Full Infrastructure](#9-docker-compose--full-infrastructure)
10. [Environment Variables](#10-environment-variables)
11. [Verification Checklist](#11-verification-checklist)

---

## 1. Prerequisites

Install the following on your machine before starting. Verify each one.

```bash
# Node.js — must be 20.x or higher
node --version        # expected: v20.x.x or v22.x.x

# pnpm — install globally if missing
npm install -g pnpm
pnpm --version        # expected: 9.x.x

# Docker + Docker Compose
docker --version      # expected: 24.x or higher
docker compose version # expected: v2.x.x

# Git
git --version
```

---

## 2. Monorepo Root Setup

### 2.1 Create the root folder and init git

```bash
mkdir ihjizli
cd ihjizli
git init
```

### 2.2 Create root `package.json`

Create file: `package.json`

```json
{
  "name": "ihjizli",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "pnpm --parallel --filter './apps/*' --filter './backend' dev",
    "build": "pnpm --recursive build",
    "lint": "pnpm --recursive lint",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    "test": "pnpm --recursive test",
    "docker:up": "docker compose up -d",
    "docker:down": "docker compose down",
    "docker:logs": "docker compose logs -f",
    "db:migrate": "pnpm --filter backend db:migrate",
    "db:seed": "pnpm --filter backend db:seed"
  },
  "devDependencies": {
    "prettier": "^3.3.0",
    "typescript": "^5.5.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  }
}
```

### 2.3 Create `pnpm-workspace.yaml`

Create file: `pnpm-workspace.yaml`

```yaml
packages:
  - 'apps/*'
  - 'backend'
  - 'packages/*'
```

### 2.4 Create `.gitignore`

Create file: `.gitignore`

```
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
.next/
build/

# Environment variables — NEVER commit these
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp

# Docker volumes (local dev data)
.docker-data/

# Test coverage
coverage/
```

### 2.5 Create root folder structure

```bash
mkdir -p apps/web
mkdir -p apps/admin
mkdir -p backend
mkdir -p packages/core
mkdir -p infra/kong
mkdir -p infra/keycloak
mkdir -p infra/nginx
mkdir -p docs
```

---

## 3. Shared TypeScript Config

### 3.1 Root `tsconfig.base.json`

Create file: `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
```

---

## 4. Shared ESLint + Prettier Config

### 4.1 Root `.prettierrc`

Create file: `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always"
}
```

### 4.2 Root `.prettierignore`

Create file: `.prettierignore`

```
node_modules
dist
.next
build
coverage
*.md
pnpm-lock.yaml
```

---

## 5. packages/core — Shared Types

This package contains types and Zod schemas shared between the backend, web app, and admin panel.

### 5.1 Initialize the package

```bash
cd packages/core
```

Create file: `packages/core/package.json`

```json
{
  "name": "@ihjizli/core",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "lint": "eslint src --ext .ts"
  },
  "devDependencies": {
    "typescript": "^5.5.0"
  },
  "dependencies": {
    "zod": "^3.23.0"
  }
}
```

Create file: `packages/core/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

### 5.2 Create shared types

Create file: `packages/core/src/types/user.types.ts`

```typescript
export type UserRole = 'guest' | 'host' | 'admin' | 'superadmin';

export type AccountStatus = 'active' | 'id_verified' | 'suspended' | 'banned';

export interface UserProfile {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  languages: string[];
  status: AccountStatus;
  isHost: boolean;
  createdAt: Date;
}
```

Create file: `packages/core/src/types/listing.types.ts`

```typescript
export type ListingType =
  | 'apartment'
  | 'house'
  | 'private_room'
  | 'shared_room'
  | 'villa'
  | 'chalet'
  | 'studio';

export type ListingStatus =
  | 'draft'
  | 'pending_review'
  | 'active'
  | 'paused'
  | 'rejected'
  | 'suspended';

export type CancellationPolicy = 'flexible' | 'moderate' | 'strict';

export interface ListingSummary {
  id: string;
  title: string;
  listingType: ListingType;
  city: string;
  governorate: string;
  latitude: number;
  longitude: number;
  basePricePerNight: number;
  currency: string;
  coverPhotoUrl: string;
  avgRating: number | null;
  reviewCount: number;
  instantBookEnabled: boolean;
  status: ListingStatus;
}
```

Create file: `packages/core/src/types/booking.types.ts`

```typescript
export type BookingStatus =
  | 'pending_approval'
  | 'pending_payment'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'disputed'
  | 'payout_released';

export interface BookingSummary {
  id: string;
  listingId: string;
  guestId: string;
  hostId: string;
  checkinDate: string;
  checkoutDate: string;
  nights: number;
  guests: number;
  totalAmount: number;
  platformFee: number;
  hostPayout: number;
  currency: string;
  status: BookingStatus;
  createdAt: Date;
}
```

Create file: `packages/core/src/types/search.types.ts`

```typescript
export interface ParsedSearchQuery {
  propertyType: string | null;
  bedrooms: number | null;
  city: string | null;
  governorate: string | null;
  amenities: string[];
  features: string[];
  minCapacity: number | null;
  priceSignal: 'budget' | 'mid' | 'luxury' | null;
  checkin: string | null;
  checkout: string | null;
  months: number[] | null;
  durationSignal: 'night' | 'weekend' | 'week' | null;
  confidence: number;
}

export interface SearchFilters {
  query?: string;
  parsed?: ParsedSearchQuery;
  city?: string;
  checkin?: string;
  checkout?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  bedrooms?: number;
  amenities?: string[];
  instantBook?: boolean;
  page?: number;
  limit?: number;
}
```

Create file: `packages/core/src/index.ts`

```typescript
// Types
export * from './types/user.types';
export * from './types/listing.types';
export * from './types/booking.types';
export * from './types/search.types';
```

---

## 6. Backend — NestJS Scaffold

### 6.1 Initialize NestJS project

```bash
cd backend
pnpm init
```

Create file: `backend/package.json`

```json
{
  "name": "@ihjizli/backend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main.js",
    "lint": "eslint src --ext .ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "db:migrate": "ts-node database/migrate.ts",
    "db:seed": "ts-node database/seed.ts"
  },
  "dependencies": {
    "@nestjs/common": "^10.4.0",
    "@nestjs/core": "^10.4.0",
    "@nestjs/config": "^3.2.0",
    "@nestjs/event-emitter": "^2.0.4",
    "@nestjs/schedule": "^4.1.0",
    "@nestjs/platform-express": "^10.4.0",
    "@nestjs/swagger": "^7.4.0",
    "@nestjs/websockets": "^10.4.0",
    "@nestjs/platform-socket.io": "^10.4.0",
    "@socket.io/redis-adapter": "^8.3.0",
    "socket.io": "^4.7.5",
    "pg": "^8.12.0",
    "ioredis": "^5.4.1",
    "mongoose": "^8.5.0",
    "zod": "^3.23.0",
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "@ihjizli/core": "workspace:*"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.4.0",
    "@nestjs/testing": "^10.4.0",
    "@types/node": "^20.14.0",
    "@types/pg": "^8.11.6",
    "@types/express": "^4.17.21",
    "@types/compression": "^1.7.5",
    "typescript": "^5.5.0",
    "ts-node": "^10.9.2",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.12",
    "ts-jest": "^29.2.3"
  }
}
```

### 6.2 NestJS tsconfig

Create file: `backend/tsconfig.json`

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "paths": {
      "@ihjizli/core": ["../packages/core/src/index.ts"]
    }
  },
  "include": ["src", "database"]
}
```

Create file: `backend/nest-cli.json`

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "webpack": false
  }
}
```

### 6.3 Main entry point

Create file: `backend/src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS — only allow known origins
  app.enableCors({
    origin: [
      process.env.WEB_URL ?? 'http://localhost:3000',
      process.env.ADMIN_URL ?? 'http://localhost:3001',
    ],
    credentials: true,
  });

  // Global validation pipe — strips unknown fields, validates DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger — development only
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Ihjizli API')
      .setDescription('Rental marketplace API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    logger.log('Swagger available at /docs');
  }

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  logger.log(`Backend running on port ${port}`);
}

bootstrap();
```

### 6.4 App module

Create file: `backend/src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './common/database/database.module';
import { RedisModule } from './common/redis/redis.module';
import { MongoModule } from './common/mongo/mongo.module';
import { HealthModule } from './common/health/health.module';
import { UserModule } from './modules/user/user.module';
import { ListingModule } from './modules/listing/listing.module';
import { BookingModule } from './modules/booking/booking.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ChatModule } from './modules/chat/chat.module';
import { SearchModule } from './modules/search/search.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AdminModule } from './modules/admin/admin.module';
import { MediaModule } from './modules/media/media.module';
import { appConfig } from './common/config/app.config';

@Module({
  imports: [
    // Config — must be first
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: '.env',
    }),

    // Async infrastructure
    EventEmitterModule.forRoot({ wildcard: true, delimiter: '.' }),
    ScheduleModule.forRoot(),

    // Infrastructure modules
    DatabaseModule,
    RedisModule,
    MongoModule,

    // Health check
    HealthModule,

    // Feature modules
    UserModule,
    ListingModule,
    BookingModule,
    PaymentModule,
    ChatModule,
    SearchModule,
    NotificationModule,
    AdminModule,
    MediaModule,
  ],
})
export class AppModule {}
```

### 6.5 Config

Create file: `backend/src/common/config/app.config.ts`

```typescript
import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),

  // PostgreSQL
  DATABASE_URL: z.string().min(1),

  // Redis
  REDIS_URL: z.string().min(1),

  // MongoDB
  MONGODB_URL: z.string().min(1),

  // MinIO
  MINIO_ENDPOINT: z.string().min(1),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_ACCESS_KEY: z.string().min(1),
  MINIO_SECRET_KEY: z.string().min(1),
  MINIO_USE_SSL: z.coerce.boolean().default(false),
  MINIO_CDN_URL: z.string().min(1),

  // Keycloak
  KEYCLOAK_URL: z.string().min(1),
  KEYCLOAK_REALM: z.string().min(1),
  KEYCLOAK_CLIENT_ID: z.string().min(1),
  KEYCLOAK_CLIENT_SECRET: z.string().min(1),

  // App URLs
  WEB_URL: z.string().default('http://localhost:3000'),
  ADMIN_URL: z.string().default('http://localhost:3001'),

  // PSP (CLICTOPAY)
  CLICTOPAY_URL: z.string().optional(),
  CLICTOPAY_MERCHANT_ID: z.string().optional(),
  CLICTOPAY_PASSWORD: z.string().optional(),
  CLICTOPAY_WEBHOOK_SECRET: z.string().optional(),

  // AI Search
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
});

export const appConfig = registerAs('app', () => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten());
    process.exit(1);
  }
  return parsed.data;
});

export type AppConfig = z.infer<typeof envSchema>;
```

### 6.6 Database module

Create file: `backend/src/common/database/database.module.ts`

```typescript
import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export const PG_POOL = 'PG_POOL';

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Pool({
          connectionString: config.get('app.DATABASE_URL'),
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
          ssl:
            config.get('app.NODE_ENV') === 'production'
              ? { rejectUnauthorized: false }
              : false,
        });
      },
    },
  ],
  exports: [PG_POOL],
})
export class DatabaseModule {}
```

### 6.7 Redis module

Create file: `backend/src/common/redis/redis.module.ts`

```typescript
import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const client = new Redis(config.get('app.REDIS_URL') as string, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          lazyConnect: false,
        });
        client.on('error', (err) => console.error('Redis error:', err));
        client.on('connect', () => console.log('Redis connected'));
        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
```

### 6.8 MongoDB module

Create file: `backend/src/common/mongo/mongo.module.ts`

```typescript
import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';

export const MONGO_CONNECTION = 'MONGO_CONNECTION';

@Global()
@Module({
  providers: [
    {
      provide: MONGO_CONNECTION,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const conn = await mongoose.connect(
          config.get('app.MONGODB_URL') as string,
          { dbName: 'ihjizli_chat' },
        );
        console.log('MongoDB connected');
        return conn;
      },
    },
  ],
  exports: [MONGO_CONNECTION],
})
export class MongoModule {}
```

### 6.9 Health module

Create file: `backend/src/common/health/health.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({ controllers: [HealthController] })
export class HealthModule {}
```

Create file: `backend/src/common/health/health.controller.ts`

```typescript
import { Controller, Get, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import Redis from 'ioredis';
import mongoose from 'mongoose';
import { PG_POOL } from '../database/database.module';
import { REDIS_CLIENT } from '../redis/redis.module';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(PG_POOL) private readonly db: Pool,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  @Get()
  async check() {
    const [pg, redis, mongo] = await Promise.allSettled([
      this.db.query('SELECT 1'),
      this.redis.ping(),
      mongoose.connection.readyState === 1
        ? Promise.resolve('ok')
        : Promise.reject(new Error('disconnected')),
    ]);

    return {
      status: 'ok',
      service: 'ihjizli-backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      dependencies: {
        postgres: pg.status === 'fulfilled' ? 'ok' : 'error',
        redis: redis.status === 'fulfilled' ? 'ok' : 'error',
        mongodb: mongo.status === 'fulfilled' ? 'ok' : 'error',
      },
    };
  }
}
```

### 6.10 Empty module shells

Create one file for each module — exact same pattern. Do this for all 9:

Create file: `backend/src/modules/user/user.module.ts`

```typescript
import { Module } from '@nestjs/common';

@Module({})
export class UserModule {}
```

Repeat for:
- `backend/src/modules/listing/listing.module.ts`
- `backend/src/modules/booking/booking.module.ts`
- `backend/src/modules/payment/payment.module.ts`
- `backend/src/modules/chat/chat.module.ts`
- `backend/src/modules/search/search.module.ts`
- `backend/src/modules/notification/notification.module.ts`
- `backend/src/modules/admin/admin.module.ts`
- `backend/src/modules/media/media.module.ts`

All identical shell — they get filled in their respective phases.

### 6.11 Database folder structure

```bash
mkdir -p backend/database/migrations
mkdir -p backend/database/seeds
```

Create file: `backend/database/migrate.ts`

```typescript
import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  // Create migrations tracking table if it doesn't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const { rows } = await pool.query(
      'SELECT id FROM schema_migrations WHERE filename = $1',
      [file],
    );

    if (rows.length > 0) {
      console.log(`  skip: ${file} (already executed)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`  run:  ${file}`);

    await pool.query('BEGIN');
    try {
      await pool.query(sql);
      await pool.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [file],
      );
      await pool.query('COMMIT');
      console.log(`  done: ${file}`);
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error(`  FAILED: ${file}`, err);
      process.exit(1);
    }
  }

  await pool.end();
  console.log('All migrations complete.');
}

migrate();
```

Create placeholder: `backend/database/migrations/.gitkeep`

---

## 7. apps/web — Next.js 15 Scaffold

### 7.1 Create Next.js 15 app

```bash
cd apps/web
pnpm create next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-eslint
```

### 7.2 Update `apps/web/package.json`

Add the workspace dependency and update the name:

```json
{
  "name": "@ihjizli/web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@ihjizli/core": "workspace:*",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next-intl": "^3.17.0",
    "zod": "^3.23.0",
    "@tanstack/react-query": "^5.51.0",
    "zustand": "^4.5.4",
    "socket.io-client": "^4.7.5",
    "react-hook-form": "^7.52.1",
    "@hookform/resolvers": "^3.9.0"
  },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.5.0",
    "tailwindcss": "^4.0.0",
    "postcss": "^8.4.40",
    "autoprefixer": "^10.4.19"
  }
}
```

### 7.3 Next.js config

Create file: `apps/web/next.config.ts`

```typescript
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_MINIO_CDN_HOSTNAME ?? 'cdn.ihjizli.tn',
      },
    ],
  },
  experimental: {
    typedRoutes: true,
  },
};

export default withNextIntl(nextConfig);
```

### 7.4 i18n setup (placeholder — full implementation in Phase 14)

Create file: `apps/web/src/i18n/request.ts`

```typescript
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}.json`)).default,
}));
```

Create file: `apps/web/src/messages/ar.json`

```json
{
  "common": {
    "search": "ابحث",
    "login": "تسجيل الدخول",
    "register": "إنشاء حساب",
    "logout": "تسجيل الخروج"
  }
}
```

Create file: `apps/web/src/messages/fr.json`

```json
{
  "common": {
    "search": "Rechercher",
    "login": "Se connecter",
    "register": "Créer un compte",
    "logout": "Se déconnecter"
  }
}
```

Create file: `apps/web/src/messages/en.json`

```json
{
  "common": {
    "search": "Search",
    "login": "Sign in",
    "register": "Create account",
    "logout": "Sign out"
  }
}
```

### 7.5 Root layout placeholder

Create file: `apps/web/src/app/layout.tsx`

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ihjizli — احجزلي',
  description: 'منصة الإيجار التونسية الأولى',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
```

Create file: `apps/web/src/app/page.tsx`

```tsx
export default function HomePage() {
  return (
    <main>
      <h1>Ihjizli — احجزلي</h1>
      <p>Phase 01 complete. UI coming in Phase 14.</p>
    </main>
  );
}
```

---

## 8. apps/admin — Next.js 15 Scaffold

Exact same process as web app but simpler.

### 8.1 Create Next.js 15 app

```bash
cd apps/admin
pnpm create next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-eslint
```

### 8.2 Update `apps/admin/package.json`

```json
{
  "name": "@ihjizli/admin",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo --port 3001",
    "build": "next build",
    "start": "next start --port 3001",
    "lint": "next lint"
  },
  "dependencies": {
    "@ihjizli/core": "workspace:*",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-query": "^5.51.0",
    "zustand": "^4.5.4",
    "react-hook-form": "^7.52.1",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.5.0",
    "tailwindcss": "^4.0.0",
    "postcss": "^8.4.40",
    "autoprefixer": "^10.4.19"
  }
}
```

Create file: `apps/admin/src/app/page.tsx`

```tsx
export default function AdminPage() {
  return (
    <main>
      <h1>Ihjizli Admin</h1>
      <p>Phase 01 complete. Admin UI coming in Phase 19.</p>
    </main>
  );
}
```

---

## 9. Docker Compose — Full Infrastructure

Create file: `docker-compose.yml` (root of the project)

```yaml
name: ihjizli

services:

  # ─────────────────────────────────────────
  # PostgreSQL
  # ─────────────────────────────────────────
  postgres:
    image: postgis/postgis:16-3.4-alpine
    container_name: ihjizli-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ihjizli
      POSTGRES_USER: ihjizli
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - .docker-data/postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ihjizli -d ihjizli"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ─────────────────────────────────────────
  # MongoDB
  # ─────────────────────────────────────────
  mongodb:
    image: mongo:7
    container_name: ihjizli-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ihjizli
      MONGO_INITDB_ROOT_PASSWORD: ${MONGODB_PASSWORD}
      MONGO_INITDB_DATABASE: ihjizli_chat
    ports:
      - "27017:27017"
    volumes:
      - .docker-data/mongodb:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ─────────────────────────────────────────
  # Redis
  # ─────────────────────────────────────────
  redis:
    image: redis:7-alpine
    container_name: ihjizli-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - .docker-data/redis:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ─────────────────────────────────────────
  # MinIO
  # ─────────────────────────────────────────
  minio:
    image: minio/minio:latest
    container_name: ihjizli-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - .docker-data/minio:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ─────────────────────────────────────────
  # Keycloak
  # ─────────────────────────────────────────
  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    container_name: ihjizli-keycloak
    restart: unless-stopped
    command: start-dev --import-realm
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/ihjizli
      KC_DB_SCHEMA: keycloak
      KC_DB_USERNAME: ihjizli
      KC_DB_PASSWORD: ${POSTGRES_PASSWORD}
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD}
      KC_HOSTNAME: localhost
      KC_HOSTNAME_PORT: 8080
      KC_HTTP_ENABLED: "true"
    ports:
      - "8080:8080"
    volumes:
      - ./infra/keycloak:/opt/keycloak/data/import
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "exec 3<>/dev/tcp/localhost/8080; echo -e 'GET /health/ready HTTP/1.1\\r\\nHost: localhost\\r\\n\\r\\n' >&3; cat <&3 | grep -q '200 OK'"]
      interval: 30s
      timeout: 10s
      retries: 10
      start_period: 60s

  # ─────────────────────────────────────────
  # Kong
  # ─────────────────────────────────────────
  kong-migrations:
    image: kong:3
    container_name: ihjizli-kong-migrations
    command: kong migrations bootstrap
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: postgres
      KONG_PG_DATABASE: ihjizli
      KONG_PG_SCHEMA: kong
      KONG_PG_USER: ihjizli
      KONG_PG_PASSWORD: ${POSTGRES_PASSWORD}
    depends_on:
      postgres:
        condition: service_healthy
    restart: on-failure

  kong:
    image: kong:3
    container_name: ihjizli-kong
    restart: unless-stopped
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /kong/kong.yml
      KONG_PROXY_LISTEN: "0.0.0.0:8000"
      KONG_ADMIN_LISTEN: "0.0.0.0:8001"
      KONG_LOG_LEVEL: info
    ports:
      - "8000:8000"
      - "8001:8001"
    volumes:
      - ./infra/kong/kong.yml:/kong/kong.yml:ro
    depends_on:
      - kong-migrations
    healthcheck:
      test: ["CMD", "kong", "health"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ─────────────────────────────────────────
  # Backend (NestJS Monolith)
  # ─────────────────────────────────────────
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: development
    container_name: ihjizli-backend
    restart: unless-stopped
    env_file: ./backend/.env
    ports:
      - "4000:4000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      mongodb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/api/health"]
      interval: 15s
      timeout: 5s
      retries: 5

  # ─────────────────────────────────────────
  # Web App (Next.js)
  # ─────────────────────────────────────────
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
      target: development
    container_name: ihjizli-web
    restart: unless-stopped
    env_file: ./apps/web/.env.local
    ports:
      - "3000:3000"
    volumes:
      - ./apps/web:/app
      - ./packages:/packages
      - /app/node_modules
      - /app/.next
    depends_on:
      - backend

  # ─────────────────────────────────────────
  # Admin App (Next.js)
  # ─────────────────────────────────────────
  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
      target: development
    container_name: ihjizli-admin
    restart: unless-stopped
    env_file: ./apps/admin/.env.local
    ports:
      - "3001:3001"
    volumes:
      - ./apps/admin:/app
      - ./packages:/packages
      - /app/node_modules
      - /app/.next
    depends_on:
      - backend
```

---

## 10. Environment Variables

### 10.1 Root `.env.example`

Create file: `.env.example`

```bash
# PostgreSQL
POSTGRES_PASSWORD=changeme_in_production

# MongoDB
MONGODB_PASSWORD=changeme_in_production

# Redis
REDIS_PASSWORD=changeme_in_production

# MinIO
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=changeme_in_production

# Keycloak
KEYCLOAK_ADMIN_PASSWORD=changeme_in_production
```

Create your local `.env` by copying:

```bash
cp .env.example .env
# Edit .env with your local passwords
```

### 10.2 Backend `.env.example`

Create file: `backend/.env.example`

```bash
NODE_ENV=development
PORT=4000

# PostgreSQL
DATABASE_URL=postgresql://ihjizli:changeme@localhost:5432/ihjizli

# Redis
REDIS_URL=redis://:changeme@localhost:6379

# MongoDB
MONGODB_URL=mongodb://ihjizli:changeme@localhost:27017/ihjizli_chat?authSource=admin

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=changeme_in_production
MINIO_USE_SSL=false
MINIO_CDN_URL=http://localhost:9000

# Keycloak
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=ihjizli
KEYCLOAK_CLIENT_ID=ihjizli-services
KEYCLOAK_CLIENT_SECRET=changeme

# App URLs
WEB_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001

# PSP (fill in when available from CLICTOPAY)
CLICTOPAY_URL=
CLICTOPAY_MERCHANT_ID=
CLICTOPAY_PASSWORD=
CLICTOPAY_WEBHOOK_SECRET=

# AI Search (use one)
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
```

Create your backend `.env` from this:

```bash
cp backend/.env.example backend/.env
```

### 10.3 Web app `.env.local.example`

Create file: `apps/web/.env.local.example`

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=ihjizli
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=ihjizli-web
NEXT_PUBLIC_MINIO_CDN_URL=http://localhost:9000
NEXT_PUBLIC_MINIO_CDN_HOSTNAME=localhost
```

---

## 11. Verification Checklist

Run each command and confirm the expected output before marking Phase 01 complete.

### 11.1 Install all dependencies

```bash
# From the root of the project
pnpm install
```

Expected: no errors, lockfile created.

### 11.2 Start all infrastructure containers

```bash
docker compose up -d postgres mongodb redis minio keycloak kong
```

Check all containers are healthy:

```bash
docker compose ps
```

Expected: all services show `healthy` or `running`. Keycloak may take 60-90 seconds.

### 11.3 Verify each container

```bash
# PostgreSQL — should return 1
docker exec ihjizli-postgres psql -U ihjizli -d ihjizli -c "SELECT 1;"

# Redis — should return PONG
docker exec ihjizli-redis redis-cli -a <your_password> ping

# MongoDB — should return { ok: 1 }
docker exec ihjizli-mongodb mongosh --username ihjizli --password <your_password> --eval "db.adminCommand('ping')"

# MinIO — open http://localhost:9001 in browser, login with your credentials

# Keycloak — open http://localhost:8080 in browser, login with admin credentials

# Kong — should return Kong's config
curl http://localhost:8001/
```

### 11.4 Start the backend

```bash
cd backend
pnpm install
pnpm dev
```

Expected output:
```
[Bootstrap] Backend running on port 4000
[Bootstrap] Swagger available at /docs
```

### 11.5 Verify health endpoint

```bash
curl http://localhost:4000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "ihjizli-backend",
  "version": "1.0.0",
  "timestamp": "...",
  "dependencies": {
    "postgres": "ok",
    "redis": "ok",
    "mongodb": "ok"
  }
}
```

### 11.6 Start the web app

```bash
cd apps/web
pnpm install
pnpm dev
```

Expected: Next.js compiles and opens at `http://localhost:3000`

### 11.7 Verify Swagger docs

Open `http://localhost:4000/docs` in browser.
Expected: Swagger UI loads with one endpoint visible (`GET /health`).

---

## ✅ Phase 01 Complete

When all items in Section 11 pass, Phase 01 is done.

**Confirm with:** "Phase 01 complete" and you will receive PHASE_02.md

---

*End of PHASE_01.md*
*Next: PHASE_02.md — Keycloak realm configuration + Kong routing*
