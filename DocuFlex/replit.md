# Overview

This is a full-stack tour management application called "Desert Voyagers" built for managing tourism business operations. The application provides comprehensive functionality for tracking tours, managing tourists, handling financial transactions, and organizing files. It features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and Drizzle ORM for database operations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for consistent, accessible components
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Layout**: Responsive design with mobile-first approach, featuring a collapsible sidebar navigation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API structure with organized route handlers
- **File Uploads**: Multer middleware for handling file uploads with size limits
- **Development**: Hot reload with Vite integration for development mode
- **Error Handling**: Centralized error handling middleware with structured responses

## Data Storage Solutions
- **Database**: PostgreSQL as the primary database
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema**: Shared schema definitions between frontend and backend using Drizzle-Zod
- **Tables**: Four main entities - tours, tourists, transactions, and files
- **Migrations**: Database migrations managed through Drizzle Kit
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development

## Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Security**: Basic request logging and error handling middleware
- **File Access**: Controlled file upload and access with size limitations

## Data Models
- **Tours**: Complete tour information including dates, capacity, pricing, and status tracking
- **Tourists**: Customer records with booking information and status management
- **Transactions**: Financial tracking for both income and expenses with categorization
- **Files**: Document management with metadata including file type, size, and categorization

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting (@neondatabase/serverless)
- **Connection**: Environment-based DATABASE_URL configuration for flexible deployment

## UI and Styling
- **Radix UI**: Comprehensive accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe styling variants
- **Date-fns**: Date manipulation and formatting utilities

## Development Tools
- **Vite**: Fast build tool with hot module replacement
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development server
- **Replit Integration**: Development environment optimizations and error overlay

## File Processing
- **Multer**: File upload middleware with configurable storage and limits
- **File System**: Local file storage with organized directory structure

## Form and Validation
- **Zod**: Runtime type validation and schema definition
- **React Hook Form**: Performance-optimized form handling
- **Hookform Resolvers**: Integration layer for validation schemas

The application is designed for deployment flexibility with environment-based configuration and can scale from development to production environments seamlessly.