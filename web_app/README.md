# Tutor AI Farmasi - Web Application

This is the frontend and user interface for the Tutor AI Farmasi project, built with Next.js and TypeScript.

## Getting Started

### 1. Prerequisites

Ensure you have **Node.js** (v18+) and **pnpm** installed on your system.

### 2. Installation

Install the project dependencies and generate the Prisma Client:

```bash
pnpm install
pnpm prisma generate
```

### 3. Environment Variables

Copy the `.env.example` file and create a `.env` file with the following variables:

```bash
DATABASE_URL=
DIRECT_URL=
BETTER_AUTH_URL=
BETTER_AUTH_SECRET=
AI_ENGINE_URL=
```

### 4. Running the Development Server

Start the application:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Technology Stack

- **Next.js**: React framework for high-performance applications.
- **TypeScript**: Static typing for robust code.
- **Prisma**: ORM for database interactions.
- **TailwindCSS**: Utility-first styling.
- **Better Auth**: Authentication and authorization management.

## Project Structure

- `src/app/`: Next.js app directory and routing.
- `src/components/`: Reusable React components.
- `src/lib/`: Shared utility functions and configurations.
- `prisma/`: Database schema and migration files.
- `public/`: Static assets (images, fonts).
