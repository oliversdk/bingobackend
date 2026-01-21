# Bingo.dk Admin & Analytics Dashboard

## Overview

This is a comprehensive backend analytics dashboard for Bingo.dk, a Danish online casino specializing in bingo and related games. The application provides real-time monitoring of casino operations including player analytics, game performance metrics, affiliate tracking, and financial KPIs (GGR, NGR, ARPU). It's designed to handle 20,000+ users with real-time data updates and visualization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom CSS variables for theming
- **Charts**: Recharts for data visualization
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful JSON API endpoints under `/api/*`
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod with drizzle-zod for type-safe schema validation

### Data Storage
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **Schema Location**: `shared/schema.ts` - defines users, games, affiliates, and transactions tables
- **Migrations**: Drizzle Kit for database migrations stored in `/migrations`

### Project Structure
```
├── client/src/          # React frontend application
│   ├── components/      # Reusable UI components
│   ├── pages/           # Route page components
│   ├── lib/             # Utilities, API client, query options
│   └── hooks/           # Custom React hooks
├── server/              # Express backend
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Database access layer
│   └── db.ts            # Database connection
├── shared/              # Shared code between client/server
│   └── schema.ts        # Drizzle database schema
└── script/              # Build and seed scripts
```

### Key Design Patterns
- **Storage Interface**: `server/storage.ts` abstracts all database operations behind an interface
- **Query Options Factory**: `client/src/lib/api.ts` exports TanStack Query options for consistent data fetching
- **Shared Types**: Database types are inferred from Drizzle schema and shared between frontend/backend
- **Component Composition**: UI built using shadcn/ui patterns with Radix primitives

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Database queries and schema management
- **connect-pg-simple**: PostgreSQL session store (available but sessions not currently implemented)

### Frontend Libraries
- **@tanstack/react-query**: Server state management with automatic caching
- **recharts**: Charting library for analytics visualizations
- **@radix-ui/***: Accessible UI primitives (dialog, dropdown, tabs, etc.)
- **wouter**: Lightweight client-side routing
- **date-fns**: Date manipulation utilities
- **@faker-js/faker**: Test data generation for seeding

### Development Tools
- **Vite**: Frontend build tool with HMR
- **tsx**: TypeScript execution for Node.js
- **drizzle-kit**: Database migration tooling
- **esbuild**: Production server bundling

### Replit-Specific Integrations
- **@replit/vite-plugin-runtime-error-modal**: Error overlay in development
- **@replit/vite-plugin-cartographer**: Development tooling (dev only)
- **@replit/vite-plugin-dev-banner**: Development environment indicator