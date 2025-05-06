# MaturaMate Project Restructuring Plan

## 1. Current Structure Analysis

### Loading Components

- **Multiple Loading Skeletons**: Several specialized loading components with inconsistent naming and location:
  - `exercises-loading-server.tsx`
  - `exercises-mobile-loading-server.tsx`
  - `exercises-responsive-loading-server.tsx`
  - `page-loading-server.tsx`
  - `statistics-loading-server.tsx`
- **Inconsistent Pattern**: Only exercises has mobile/responsive versions, other sections don't follow this pattern

### Data Fetching and Component Structure

- **Server/Client Split**: Data fetching in `-server.tsx` files, UI in `-client.tsx` files, but naming is inconsistent
- **File Organization**: Some data fetchers are in the page directory, others in components directory
- **Cached Functions**: Possibly redundant or inefficient data fetching with multiple cache implementations

### Component Hierarchy

- **Unclear Boundaries**: Mixed responsibilities between server/client components
- **Inconsistent Naming**: Various naming conventions used across the project:
  - Some files use `component-name.tsx`
  - Others use `componentName.tsx`
  - Some have suffixes like `-client.tsx` or `-server.tsx`

### Code Duplication

- **Repeated Patterns**: Similar code patterns implemented differently across components
- **Potential Redundancies**: Multiple ways of handling loading states, data fetching, etc.

## 2. Restructuring Goals

1. **Standardize Component Organization**:

   - Clear separation of concerns
   - Consistent naming conventions
   - Predictable file locations

2. **Optimize Loading States**:

   - Unified loading component system
   - Consistent responsive handling
   - Minimal but effective skeleton UI

3. **Improve Data Fetching**:

   - Centralized caching strategy
   - Remove redundant fetching
   - Optimize server components

4. **Enhance Maintainability**:
   - Better documentation
   - Consistent patterns across the codebase
   - Clearer component boundaries

## 3. Task Breakdown

### Phase 1: Standardize Loading Components (Priority High)

- [x] Create a single unified loading component system under `/src/components/loading/`
- [x] Implement base skeleton components with configurable properties
- [x] Create responsive wrapper HOC for all loading components
- [x] Replace all current loading implementations with new unified system
- [x] Remove redundant loading components

### Phase 2: Reorganize Component Structure (Priority High)

- [x] Establish clear directory structure rules (client vs server, page-specific vs shared)
- [x] Move all UI components to appropriate locations
- [x] Standardize file naming conventions
- [x] Update imports across the codebase

### Phase 3: Optimize Data Fetching (Priority Medium)

- [x] Analyze and document all data fetching patterns
- [x] Centralize reusable data fetching functions
- [x] Implement consistent caching strategy
- [x] Eliminate redundant or inefficient data fetchers

### Phase 4: Clean Up and Document (Priority Medium)

- [x] Remove unused code and components
- [x] Add documentation for key patterns and components
- [x] Create component usage examples
- [x] Update README with architecture overview

## 4. Implementation Plan

### Phase 1: Standardize Loading Components

1. **Create Base Loading Components**

   - [x] Create `BaseCardSkeleton.tsx` - configurable card skeleton
   - [x] Create `BaseListSkeleton.tsx` - configurable list skeleton
   - [x] Create `ResponsiveSkeletonWrapper.tsx` - HOC for responsive skeletons

2. **Create Page-Specific Loading Components**

   - [x] Create `DashboardSkeleton.tsx` using base components
   - [x] Create `ExercisesSkeleton.tsx` using base components
   - [x] Create `StatisticsSkeleton.tsx` using base components

3. **Update Page Components**

   - [x] Update dashboard page to use new loading components
   - [x] Update exercises pages to use new loading components
   - [x] Update statistics page to use new loading components

4. **Clean Up**
   - [x] Remove old loading component files
   - [ ] Update imports across the project

### Phase 2: Reorganize Component Structure

1. **Define New Structure**

   - [x] Create `/src/components/common/` for shared components
   - [x] Create `/src/components/loading/` for all loading components
   - [x] Organize `/src/app/components/` by feature

2. **Move Components**

   - [x] Move dashboard components to appropriate locations
   - [x] Move exercise components to appropriate locations
   - [x] Move shared components to common directory

3. **Standardize Naming**
   - [x] Rename client components to `*-client.tsx`
   - [x] Rename server components to `*-server.tsx`
   - [x] Use kebab-case for filenames

### Phase 3: Optimize Data Fetching

1. **Analyze Data Patterns**

   - [x] Document all data fetching functions
   - [x] Identify redundancies and inefficiencies

2. **Implement Improvements**
   - [x] Create centralized cache utility functions
   - [x] Optimize database queries
   - [x] Implement consistent error handling

### Phase 4: Clean Up and Document

1. **Remove Unused Code**

   - [ ] Identify and remove unused imports
   - [ ] Remove deprecated components
   - [ ] Eliminate dead code

2. **Add Documentation**
   - [x] Create component documentation
   - [x] Document data flow patterns
   - [x] Update project README

## 5. Initial Implementation Focus

Start with:

1. Creating unified base loading components
2. Implementing dashboard page with new loading system
3. Once successful, extend to exercises and statistics pages

## 6. Progress Update

We've successfully completed Phase 1 of our restructuring plan:

- Created a standardized set of base skeleton components:

  - BaseCardSkeleton: A configurable card skeleton
  - BaseListSkeleton: A configurable list skeleton
  - HeaderSkeleton: A reusable page header skeleton
  - ResponsiveSkeletonWrapper: A HOC for handling mobile/desktop views

- Created page-specific skeleton components:

  - DashboardSkeleton
  - ExercisesSkeleton (with mobile support)
  - StatisticsSkeleton

- Updated all pages to use the new loading system:

  - Dashboard page
  - Statistics page
  - Exercises pages (main and topic-specific)

- Removed old loading components:
  - page-loading-server.tsx
  - statistics-loading-server.tsx
  - exercises-loading-server.tsx
  - exercises-mobile-loading-server.tsx
  - exercises-responsive-loading-server.tsx

Next steps:

1. Continue organizing components following our directory structure plan
2. Begin standardizing naming conventions across components
3. Analyze data fetching patterns for optimization opportunities
