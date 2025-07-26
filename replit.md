# Credit Calculator Application

## Overview

This is a full-stack web application for calculating loyalty program credits based on message types, audience sizes, and communication channels. The application features a React frontend with a modern UI built using shadcn/ui components and an Express.js backend with PostgreSQL database integration via Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful endpoints under `/api` prefix
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Development Features**: Request logging with response time tracking

### Data Storage Solutions
- **Database**: PostgreSQL configured via Drizzle ORM
- **ORM**: Drizzle with schema-first approach
- **Migrations**: Managed through drizzle-kit
- **Development Storage**: In-memory storage fallback for development
- **Connection**: Neon Database serverless driver for production

### Key Components

#### Database Schema
- **calculations table**: Stores credit calculation configurations with JSON fields for:
  - Credit rates per channel (SMS, email, push)
  - Selected journey stages
  - Message type configurations
  - Total credit calculations

#### Journey Stage Management
- Pre-defined journey stages with associated message types:
  - New Member Activation (8 message types)
  - Habituation & Repeat Visits (8 message types)
  - Churn Risk / Re-engagement (6 message types)
  - High-Value Customer Recognition (7 message types)
  - Evergreen Loyalty Value Add (7 message types)

#### Credit Calculation Engine
- Multi-channel support (SMS, email, push notifications)
- Frequency-based multipliers (one-time, daily, weekly, monthly)
- Audience size considerations
- Real-time calculation updates

## Data Flow

1. **Configuration**: Users set credit rates for each communication channel
2. **Journey Selection**: Users select relevant journey stages from predefined options
3. **Message Configuration**: For each selected stage, users configure:
   - Message types and their properties
   - Audience sizes
   - Communication channels
   - Frequency settings
4. **Calculation**: Real-time credit calculations based on:
   - `credits = audience_size × credit_rate × frequency_multiplier`
5. **Persistence**: Calculations can be saved to database for later retrieval
6. **Breakdown**: Detailed credit breakdowns available via modal interface

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React, React DOM, React Router (Wouter)
- **State Management**: TanStack React Query
- **UI Components**: Radix UI primitives, shadcn/ui components
- **Form Handling**: React Hook Form with Zod validation

### Database & Backend
- **Database**: Neon Database (PostgreSQL)
- **ORM**: Drizzle ORM with Zod integration
- **Validation**: Zod schemas for type-safe data validation
- **Session Management**: Connect-pg-simple for PostgreSQL session store

### Development Tools
- **Build Tools**: Vite, esbuild for production builds
- **Type Checking**: TypeScript with strict configuration
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Development**: tsx for TypeScript execution, Replit development plugins

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React application to `dist/public`
2. **Backend Build**: esbuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **Development**: Uses tsx for hot-reloading TypeScript execution
- **Production**: Compiled JavaScript execution with NODE_ENV=production
- **Database**: Environment-based DATABASE_URL configuration

### Deployment Scripts
- `dev`: Development server with hot-reloading
- `build`: Production build for both frontend and backend
- `start`: Production server startup
- `check`: TypeScript type checking
- `db:push`: Database schema synchronization

### File Structure
- `/client`: Frontend React application
- `/server`: Backend Express.js application  
- `/shared`: Shared TypeScript types and schemas
- `/dist`: Production build output
- `/migrations`: Database migration files

The application is designed for easy deployment on platforms like Replit, with development tooling optimized for the Replit environment including cartographer and runtime error modal plugins.