# MaturaMate

A modern web application to help students prepare for exams with interactive exercises, statistics tracking, and personalized study plans.

## Project Architecture

MaturaMate follows a structured architecture with clear separation between client and server components:

- **Next.js 15 with App Router**: Server-first components with client hydration
- **TypeScript**: Type-safe code throughout the application
- **Neon Database with Drizzle ORM**: Serverless PostgreSQL database with type-safe queries
- **Tailwind CSS with shadcn/ui**: Consistent and customizable UI components
- **Auth.js**: Secure authentication with session management

### Component Structure

The application follows a consistent component structure:

- **Server Components** (`*-server.tsx`): Data fetching and server-rendered UI
- **Client Components** (`*-client.tsx`): Interactive UI with client-side JavaScript
- **Page Components** (`page.tsx`): Next.js route components
- **Layout Components** (`layout.tsx`): Shared layouts for sections

For detailed architecture information, see [ARCHITECTURE.md](./src/ARCHITECTURE.md).

### Directory Structure

```
/src
├── app/                        # Next.js App Router pages
│   ├── api/                    # API routes
│   ├── dashboard/              # Dashboard section
│   │   ├── esercizi/           # Exercises pages
│   │   ├── statistiche/        # Statistics pages
│   │   └── data/               # Data fetching server components
├── components/                 # Client components
│   ├── ui/                     # shadcn/ui components
│   ├── dashboard/              # Dashboard components
│   ├── exercises/              # Exercise components
│   ├── common/                 # Shared components
│   └── loading/                # Loading components
├── lib/                        # Utility libraries
│   ├── server/                 # Server utilities
│   └── client/                 # Client utilities
└── db/                         # Database configuration
```

## Setup and Development

### Prerequisites

- Node.js 18+ and npm 8+
- Git

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/maturamate.git
cd maturamate
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. Run development server

```bash
npm run dev
```

### Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run linting
- `npm run analyze-components`: Analyze component structure
- `npm run analyze-data`: Analyze data fetching patterns

## Deployment

The application is deployed on Vercel with automatic deployments from the main branch.

## Project Structure Guidelines

To maintain consistency across the codebase, follow these guidelines:

1. **Component Naming**:

   - Use kebab-case for filenames: `component-name.tsx`
   - Client components should have `-client` suffix: `button-client.tsx`
   - Server components should have `-server` suffix: `data-fetch-server.tsx`

2. **Data Fetching**:

   - Server components: Use utilities from `@/lib/server/db`
   - Client components: Use utilities from `@/lib/client/api`

3. **Loading States**:

   - Use the consistent loading components from `@/components/loading/`

4. **Error Handling**:
   - Follow the error boundary pattern for client components
   - Use try/catch with proper error handling in server components

For more details, refer to the [implementation plan](./IMPLEMENTATION_PLAN.md).
