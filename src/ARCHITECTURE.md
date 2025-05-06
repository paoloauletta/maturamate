# MaturaMate Architecture

This document outlines the architecture and patterns used in the MaturaMate codebase.

## Component Architecture

### Directory Structure

- `/src/app/`: Next.js app router pages and routes

  - `/src/app/components/`: App-specific server components (deprecated, moving to `/src/components/`)
  - `/src/app/{feature}/`: Feature pages
  - `/src/app/{feature}/data/`: Feature-specific data fetching server components

- `/src/components/`: Client components

  - `/src/components/ui/`: shadcn/ui components only
  - `/src/components/common/`: Shared client components
  - `/src/components/{feature}/`: Feature-specific client components
  - `/src/components/loading/`: Loading components

- `/src/lib/`: Utilities and shared logic
  - `/src/lib/server/`: Server-side utilities
  - `/src/lib/client/`: Client-side utilities

### Component Naming Conventions

- Client components should have `-client` suffix: `component-name-client.tsx`
- Server components should have `-server` suffix: `component-name-server.tsx`
- Page components follow Next.js naming: `page.tsx`
- Layout components follow Next.js naming: `layout.tsx`

## Client/Server Components Pattern

### Server Components

Server components are used for:

- Data fetching from the database
- Server-side rendering of static content
- Passing data to client components

```tsx
// Server Component (dashboard-data-server.tsx)
import { getUserData } from "@/lib/server/db";

export async function DashboardDataServer() {
  const userData = await getUserData();

  return <DashboardStatsClient data={userData} />;
}
```

### Client Components

Client components are used for:

- Interactive UI elements
- Components that use React hooks
- Components that need to respond to user actions

```tsx
// Client Component (dashboard-stats-client.tsx)
"use client";

import { useState } from "react";
import { useApiData } from "@/lib/client/api";

export function DashboardStatsClient({ initialData }) {
  const [filter, setFilter] = useState("all");

  // Client-side logic here

  return <div>{/* Interactive UI */}</div>;
}
```

## Data Fetching Patterns

### Server Component Data Fetching

Server components should use the centralized data fetching utilities:

```tsx
import { getUserById, getUserExercises } from "@/lib/server/db";

export async function UserDataServer({ userId }) {
  const user = await getUserById(userId);
  const exercises = await getUserExercises(userId);

  return <UserProfileClient user={user} exercises={exercises} />;
}
```

### Client Component Data Fetching

Client components should use the client API utilities:

```tsx
"use client";

import { useApiData } from "@/lib/client/api";

export function UserSettingsClient({ userId }) {
  const { data, isLoading, error } = useApiData(
    `/api/users/${userId}/settings`
  );

  // Handle loading/error states

  return <div>{/* Render UI based on data */}</div>;
}
```

## Loading States

### Server Component Loading

```tsx
import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/loading/loading-skeleton";

export default function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AsyncDataComponent />
    </Suspense>
  );
}
```

### Client Component Loading

```tsx
'use client';

import { DataLoading } from '@/components/loading/data-loading-client';
import { useApiData } from '@/lib/client/api';

export function DataComponent() {
  const { data, isLoading, error } = useApiData('/api/data');

  return (
    <DataLoading
      data={data}
      isLoading={isLoading}
      error={error}
    >
      {(data) => (
        // Render UI with data
      )}
    </DataLoading>
  );
}
```

## Best Practices

1. Use consistent naming: `*-data-server.tsx` for dedicated data-fetching components
2. Keep client components focused on UI and interactivity
3. Use centralized data fetching utilities
4. Implement consistent loading states
5. Follow the kebab-case naming convention for files
6. Use proper caching strategies for server components

## Data Flow

1. Server components fetch data directly using `@/lib/server/db` utilities
2. Data is passed as props to client components
3. Client components handle UI state and user interactions
4. API routes (via `/app/api`) handle data mutations

## Authentication Flow

1. Auth.js handles authentication sessions
2. `getServerSession` is used in server components to access session data
3. Protected routes redirect unauthenticated users
4. Client components receive user data from server components
