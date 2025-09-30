# Clean Architecture Documentation

## Overview

This project follows Clean Architecture principles to ensure separation of concerns, maintainability, and testability.

## Layer Structure

### 1. Presentation Layer (`app/`, `widgets/`, `features/`)

**Purpose**: Handle user interface and user interactions

- **app/**: Next.js pages and routing
- **widgets/**: Complex, page-level components
- **features/**: Feature-specific reusable components

**Dependencies**: Can depend on Core layer

### 2. Core Layer (`core/`)

**Purpose**: Business logic and application state

- **providers/**: React Context for global state
  - `auth-provider.tsx`: User authentication state
  - `cart-provider.tsx`: Shopping cart state
- **lib/**: Business logic and data
  - `mock-data.ts`: Mock data for development

**Dependencies**: Independent, no dependencies on other layers

### 3. Shared Layer (`shared/`)

**Purpose**: Common utilities and types used across layers

- **types/**: TypeScript interfaces and types
- **utils/**: Helper functions (formatting, validation)
- **hooks/**: Reusable React hooks

**Dependencies**: Independent

### 4. Infrastructure Layer (`components/ui/`)

**Purpose**: External UI library components

- shadcn/ui components
- Third-party integrations

## Data Flow

\`\`\`
User Interaction
    ↓
Presentation Layer (Pages/Components)
    ↓
Core Layer (Providers/Business Logic)
    ↓
Shared Layer (Utils/Types)
    ↓
Infrastructure (UI Components)
\`\`\`

## Key Principles

### 1. Dependency Rule
- Inner layers don't know about outer layers
- Dependencies point inward
- Core layer is independent

### 2. Separation of Concerns
- Each layer has a single responsibility
- Components are focused and reusable
- Business logic separated from UI

### 3. Testability
- Mock data in core layer
- Providers can be easily mocked
- Components are pure and testable

## Component Organization

### Widgets (Page-level)
Large, complex components that compose multiple features:
- `hero-banner.tsx`: Home page hero section
- `navbar.tsx`: Site navigation
- `footer.tsx`: Site footer

### Features (Domain-specific)
Reusable components for specific features:
- `product-card.tsx`: Product display card
- Can be used across multiple pages

### UI Components
Generic, reusable UI elements:
- Buttons, Inputs, Cards
- From shadcn/ui library

## State Management

### Context Providers

**AuthProvider**
- User authentication state
- Login/logout/register functions
- Profile management

**CartProvider**
- Shopping cart items
- Add/remove/update functions
- Total calculations

### Local State
- Component-specific state using useState
- Form state
- UI state (modals, dropdowns)

## Routing Structure

\`\`\`
/                    → Home page
/products            → Product list
/products/[id]       → Product detail
/cart                → Shopping cart
/checkout            → Checkout flow
/orders              → Order history
/login               → Login page
/register            → Registration
/profile             → User profile
\`\`\`

## Type Safety

All entities are typed using TypeScript interfaces:
- `Product`: Product data structure
- `User`: User profile structure
- `CartItem`: Cart item structure
- `Order`: Order structure

## Future Scalability

### Backend Integration
- Replace mock data with API calls
- Add API layer in core/
- Implement data fetching hooks

### Database
- Add database entities
- Implement repository pattern
- Add data validation layer

### Authentication
- Replace mock auth with real JWT
- Add middleware for protected routes
- Implement refresh token logic

## Best Practices

1. **Component Composition**: Build complex UIs from simple components
2. **Props Drilling**: Use Context for global state, props for local
3. **Type Safety**: Always define TypeScript types
4. **Error Handling**: Implement proper error boundaries
5. **Loading States**: Show loading indicators for async operations
6. **Responsive Design**: Mobile-first approach
7. **Accessibility**: Semantic HTML and ARIA labels
