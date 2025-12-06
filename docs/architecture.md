# Recipe App - Architecture Documentation

## Document Information
**Version**: 1.0  
**Last Updated**: December 5, 2025  
**Architecture Pattern**: Layered Architecture with MVC principles  
**Deployment Model**: Self-hosted monolithic application

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Technology Stack](#3-technology-stack)
4. [System Components](#4-system-components)
5. [Data Flow](#5-data-flow)
6. [Database Architecture](#6-database-architecture)
7. [API Layer](#7-api-layer)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Security Architecture](#9-security-architecture)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Scalability & Performance](#11-scalability--performance)
12. [Integration Points](#12-integration-points)

---

## 1. System Overview

### 1.1 Purpose
The Recipe App is a full-stack web application that allows users to:
- Import, create, and manage recipes
- Plan meals using a calendar interface
- Generate shopping lists from meal plans
- Organize recipes using collections and tags
- Search and discover recipes

### 1.2 Architecture Style
- **Pattern**: Layered monolithic architecture
- **Communication**: RESTful API
- **State Management**: JWT-based stateless authentication
- **Database**: Relational (PostgreSQL)
- **Caching**: Redis for session storage and API caching

### 1.3 System Characteristics
- **Users**: Single-tenant per user (isolated data)
- **Scale**: 50-500 concurrent users
- **Availability**: 99.5% uptime target
- **Performance**: < 2s page load, < 200ms API response
- **Security**: HTTPS, JWT auth, input validation

---

## 2. High-Level Architecture

### 2.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Desktop    │  │    Tablet    │  │    Mobile    │      │
│  │   Browser    │  │   Browser    │  │   Browser    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                │                │
│           └────────────────┴────────────────┘                │
│                            │                                 │
│                      HTTPS/WSS                               │
└─────────────────────────────┼───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Web Server Layer                        │
│                    ┌──────────────┐                          │
│                    │     nginx    │                          │
│                    │              │                          │
│                    │ - SSL Term   │                          │
│                    │ - Reverse Px │                          │
│                    │ - Static File│                          │
│                    │ - Load Bal   │                          │
│                    └──────┬───────┘                          │
│                           │                                  │
│              ┌────────────┴────────────┐                     │
│              │                         │                     │
└──────────────┼─────────────────────────┼─────────────────────┘
               ▼                         ▼
┌──────────────────────────┐  ┌─────────────────────┐
│   Application Layer      │  │   Static Assets     │
│  ┌────────────────────┐  │  │  - React Build      │
│  │    Node.js + PM2   │  │  │  - Images/CSS/JS    │
│  │                    │  │  └─────────────────────┘
│  │ ┌────────────────┐ │  │
│  │ │  Express.js    │ │  │
│  │ │  API Server    │ │  │
│  │ └────────────────┘ │  │
│  │                    │  │
│  │ ┌────────────────┐ │  │
│  │ │  Controllers   │ │  │
│  │ └────────────────┘ │  │
│  │                    │  │
│  │ ┌────────────────┐ │  │
│  │ │   Services     │ │  │
│  │ │ - Auth         │ │  │
│  │ │ - Recipe       │ │  │
│  │ │ - Import       │ │  │
│  │ │ - AI/OCR       │ │  │
│  │ └────────────────┘ │  │
│  │                    │  │
│  │ ┌────────────────┐ │  │
│  │ │   Data Layer   │ │  │
│  │ │ (ORM/Prisma)   │ │  │
│  │ └────────────────┘ │  │
│  └────────┬───────────┘  │
│           │              │
└───────────┼──────────────┘
            │
  ┌─────────┴──────────┬───────────────┬──────────────┐
  ▼                    ▼               ▼              ▼
┌─────────────┐  ┌──────────┐  ┌─────────────┐  ┌──────────┐
│ PostgreSQL  │  │  Redis   │  │ File System │  │ External │
│  Database   │  │  Cache   │  │  (Uploads)  │  │   APIs   │
│             │  │          │  │             │  │          │
│ - Recipes   │  │ - Session│  │ - Images    │  │ - OpenAI │
│ - Users     │  │ - Rate   │  │ - Temp      │  │ - OCR    │
│ - MealPlans │  │   Limit  │  │             │  │          │
│ - Lists     │  │ - Cache  │  │             │  │          │
└─────────────┘  └──────────┘  └─────────────┘  └──────────┘
```

### 2.2 Component Interaction

```
User Request Flow:
1. User → Browser (React App)
2. Browser → nginx (HTTPS)
3. nginx → Node.js/Express (Reverse Proxy)
4. Express → Controllers (Route Handling)
5. Controllers → Services (Business Logic)
6. Services → Database/Cache (Data Access)
7. Response ← back through layers
```

---

## 3. Technology Stack

### 3.1 Complete Stack Overview

```
┌─────────────────────────────────────────────────┐
│ Frontend Layer                                   │
├─────────────────────────────────────────────────┤
│ • React 18+ (UI Framework)                      │
│ • Redux Toolkit / Zustand (State Management)    │
│ • React Router (Navigation)                     │
│ • Material-UI / Tailwind (UI Components)        │
│ • Axios (HTTP Client)                           │
│ • React Query (Data Fetching/Caching)           │
│ • React Hook Form (Forms)                       │
│ • Date-fns (Date Manipulation)                  │
│ • React DnD (Drag & Drop)                       │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Backend Layer                                    │
├─────────────────────────────────────────────────┤
│ • Node.js 20 LTS (Runtime)                      │
│ • Express.js (Web Framework)                    │
│ • Prisma (ORM)                                  │
│ • Passport.js/JWT (Authentication)              │
│ • bcrypt (Password Hashing)                     │
│ • express-validator (Validation)                │
│ • helmet (Security Headers)                     │
│ • cors (CORS Handling)                          │
│ • morgan (Logging)                              │
│ • rate-limiter-flexible (Rate Limiting)         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Data Layer                                       │
├─────────────────────────────────────────────────┤
│ • PostgreSQL 16 (Primary Database)              │
│ • Redis 7 (Caching & Sessions)                  │
│ • Local Filesystem (File Storage)               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Infrastructure Layer                             │
├─────────────────────────────────────────────────┤
│ • nginx 1.18+ (Web Server/Reverse Proxy)        │
│ • PM2 (Process Manager)                         │
│ • Ubuntu 22.04 (Operating System)               │
│ • Let's Encrypt (SSL Certificates)              │
│ • UFW (Firewall)                                │
│ • fail2ban (Intrusion Prevention)               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ External Services (Optional)                     │
├─────────────────────────────────────────────────┤
│ • OpenAI API (AI-powered features)              │
│ • Tesseract.js / Cloud OCR (Image processing)   │
│ • SMTP Service (Email notifications)            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Development Tools                                │
├─────────────────────────────────────────────────┤
│ • Git (Version Control)                         │
│ • npm/yarn (Package Management)                 │
│ • ESLint + Prettier (Code Quality)              │
│ • Jest + React Testing Library (Testing)        │
│ • Swagger/OpenAPI (API Documentation)           │
│ • VS Code (IDE)                                 │
└─────────────────────────────────────────────────┘
```

---

## 4. System Components

### 4.1 Frontend Application (React SPA)

```
src/
├── components/         # Reusable UI components
│   ├── common/        # Buttons, Inputs, Cards
│   ├── layout/        # Navbar, Sidebar, Footer
│   └── recipe/        # Recipe-specific components
│
├── pages/             # Page-level components
│   ├── Home/
│   ├── RecipeDetail/
│   ├── MealPlan/
│   ├── ShoppingList/
│   └── Profile/
│
├── hooks/             # Custom React hooks
│   ├── useAuth.js
│   ├── useRecipes.js
│   └── useMealPlan.js
│
├── store/             # State management
│   ├── slices/        # Redux slices or Zustand stores
│   └── store.js
│
├── services/          # API communication
│   ├── api.js         # Axios instance
│   ├── authService.js
│   └── recipeService.js
│
├── utils/             # Utility functions
│   ├── formatters.js
│   ├── validators.js
│   └── constants.js
│
├── styles/            # Global styles
└── App.js             # Root component
```

### 4.2 Backend Application (Node.js/Express)

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   │   ├── authController.js
│   │   ├── recipeController.js
│   │   ├── mealPlanController.js
│   │   └── shoppingListController.js
│   │
│   ├── services/         # Business logic
│   │   ├── authService.js
│   │   ├── recipeService.js
│   │   ├── importService.js
│   │   ├── aiService.js
│   │   └── ocrService.js
│   │
│   ├── models/           # Data models (Prisma)
│   │   └── schema.prisma
│   │
│   ├── middleware/       # Express middleware
│   │   ├── auth.js       # JWT authentication
│   │   ├── validation.js # Input validation
│   │   ├── rateLimit.js  # Rate limiting
│   │   └── errorHandler.js
│   │
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── recipes.js
│   │   ├── collections.js
│   │   ├── mealPlans.js
│   │   └── shoppingLists.js
│   │
│   ├── utils/            # Utility functions
│   │   ├── logger.js
│   │   ├── parser.js     # Recipe parsing
│   │   └── scraper.js    # Web scraping
│   │
│   ├── config/           # Configuration
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── jwt.js
│   │
│   └── app.js            # Express app setup
│
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
│
├── tests/                # Test files
├── .env.example          # Environment variables template
└── server.js             # Entry point
```

### 4.3 Database Layer (PostgreSQL)

**Schema Structure**: See development-requirements.md Section 3

**Key Tables**:
- users
- recipes
- collections
- recipe_collections
- meal_plans
- shopping_lists
- shopping_list_items
- recipe_imports
- user_sessions

### 4.4 Cache Layer (Redis)

**Use Cases**:
```
Redis Key Patterns:
- session:{userId}:{sessionId}   # User sessions
- user:{userId}                  # User data cache
- recipe:{recipeId}              # Recipe cache
- recipes:user:{userId}          # User's recipe list cache
- ratelimit:{ip}:{endpoint}      # Rate limiting counters
- import:queue:{importId}        # Import job status
```

---

## 5. Data Flow

### 5.1 Recipe Creation Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Fill form & submit
     ▼
┌──────────────┐
│ React Form   │
│ Component    │
└────┬─────────┘
     │
     │ 2. POST /api/v1/recipes
     ▼
┌──────────────┐
│    nginx     │
└────┬─────────┘
     │
     │ 3. Proxy to Node.js
     ▼
┌──────────────┐
│  Express.js  │
│   Routes     │
└────┬─────────┘
     │
     │ 4. Route to controller
     ▼
┌──────────────┐
│   Recipe     │
│ Controller   │
└────┬─────────┘
     │
     │ 5. Validate JWT
     ▼
┌──────────────┐
│     Auth     │
│  Middleware  │
└────┬─────────┘
     │
     │ 6. Validate input
     ▼
┌──────────────┐
│ Validation   │
│  Middleware  │
└────┬─────────┘
     │
     │ 7. Call service
     ▼
┌──────────────┐
│   Recipe     │
│   Service    │
└────┬─────────┘
     │
     │ 8. Create recipe
     ▼
┌──────────────┐
│   Prisma     │
│     ORM      │
└────┬─────────┘
     │
     │ 9. INSERT query
     ▼
┌──────────────┐
│ PostgreSQL   │
└────┬─────────┘
     │
     │ 10. Return recipe object
     │
     ▼
┌──────────────┐
│  Response    │
│   to User    │
└──────────────┘
```

### 5.2 Recipe Import from URL Flow

```
User submits URL
     │
     ▼
POST /api/v1/imports/url
     │
     ▼
Import Controller
     │
     ├──> Create import record (status: pending)
     │
     ▼
Import Service
     │
     ├──> Fetch HTML content
     │
     ├──> Parse recipe data
     │    - Check for recipe schema (JSON-LD)
     │    - Fallback: Parse HTML structure
     │
     ├──> (Optional) Send to AI for enhancement
     │
     ├──> Structure recipe object
     │
     ├──> Save to database
     │
     └──> Update import status (completed)
     │
     ▼
Return recipe to user
```

### 5.3 Authentication Flow

```
┌──────────┐
│  User    │
│ (Browser)│
└────┬─────┘
     │
     │ 1. POST /auth/login
     │    { email, password }
     ▼
┌──────────────┐
│ Auth         │
│ Controller   │
└────┬─────────┘
     │
     │ 2. Call authService
     ▼
┌──────────────┐
│ Auth Service │
│              │
│ • Find user  │
│ • Verify pwd │
│ • Gen JWT    │
└────┬─────────┘
     │
     │ 3. Query database
     ▼
┌──────────────┐
│ PostgreSQL   │
└────┬─────────┘
     │
     │ 4. Return user data
     │
     ├──> bcrypt.compare(password, hash)
     │
     ├──> jwt.sign(payload, secret)
     │
     │ 5. Store session in Redis
     ▼
┌──────────────┐
│    Redis     │
└────┬─────────┘
     │
     │ 6. Return token to client
     ▼
┌──────────────┐
│   Browser    │
│ (Save token) │
└──────────────┘
     │
     │ 7. Subsequent requests
     │    Authorization: Bearer {token}
     ▼
┌──────────────┐
│ Auth         │
│ Middleware   │
│              │
│ • Verify JWT │
│ • Check exp  │
│ • Load user  │
└──────────────┘
```

### 5.4 Meal Plan to Shopping List Flow

```
User: "Generate Shopping List"
     │
     ▼
GET /meal-plans?start_date=X&end_date=Y
     │
     ▼
Fetch meal plans for date range
     │
     ▼
For each meal plan:
  - Get recipe_id
  - Fetch recipe ingredients
     │
     ▼
Aggregate ingredients:
  - Group by ingredient name
  - Sum quantities
  - Convert units if needed
     │
     ▼
POST /shopping-lists
  - Create list
  - Create list items
     │
     ▼
Return shopping list to user
```

---

## 6. Database Architecture

### 6.1 Entity Relationship Diagram

```
┌──────────────┐
│    users     │
│──────────────│
│ id (PK)      │─┐
│ email        │ │
│ password_hash│ │
│ username     │ │
└──────────────┘ │
                 │
       ┌─────────┴──────────┬─────────────┬──────────────┐
       │                    │             │              │
       ▼                    ▼             ▼              ▼
┌──────────────┐    ┌──────────────┐  ┌────────────┐  ┌──────────────┐
│   recipes    │    │ collections  │  │ meal_plans │  │shopping_lists│
│──────────────│    │──────────────│  │────────────│  │──────────────│
│ id (PK)      │─┐  │ id (PK)      │  │ id (PK)    │  │ id (PK)      │─┐
│ user_id (FK) │ │  │ user_id (FK) │  │ user_id(FK)│  │ user_id (FK) │ │
│ title        │ │  │ name         │  │ recipe_id  │  │ name         │ │
│ ingredients  │ │  │ description  │  │ date       │  └──────────────┘ │
│ instructions │ │  └──────────────┘  │ meal_type  │                   │
│ tags[]       │ │         │          └────────────┘                   │
└──────────────┘ │         │                                            │
                 │         │                                            │
                 │         ▼                                            │
                 │  ┌────────────────┐                                 │
                 │  │ recipe_        │                                 │
                 └─>│ collections    │                                 │
                    │────────────────│                                 │
                    │ recipe_id (FK) │                                 │
                    │ collection_id  │                                 │
                    └────────────────┘                                 │
                                                                        │
                                                                        ▼
                                                                ┌──────────────────┐
                                                                │ shopping_list_   │
                                                                │ items            │
                                                                │──────────────────│
                                                                │ id (PK)          │
                                                                │ list_id (FK)     │
                                                                │ ingredient_name  │
                                                                │ quantity         │
                                                                │ checked          │
                                                                └──────────────────┘
```

### 6.2 Index Strategy

**High-Priority Indexes**:
```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Recipe queries
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX idx_recipes_tags ON recipes USING GIN(tags);
CREATE INDEX idx_recipes_title_search ON recipes USING GIN(to_tsvector('english', title));

-- Meal plan queries
CREATE INDEX idx_meal_plans_user_date ON meal_plans(user_id, planned_date);
CREATE INDEX idx_meal_plans_recipe_id ON meal_plans(recipe_id);

-- Shopping lists
CREATE INDEX idx_shopping_lists_user_id ON shopping_lists(user_id);
CREATE INDEX idx_shopping_list_items_list_id ON shopping_list_items(list_id);
```

### 6.3 Database Optimization

**Connection Pooling**:
```javascript
// Prisma configuration
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  pool     = {
    size    = 20
    timeout = 10s
  }
}
```

**Query Optimization**:
- Use `SELECT` specific columns, not `SELECT *`
- Implement pagination for all list queries
- Use database-level aggregations
- Batch operations where possible
- Use transactions for related operations

---

## 7. API Layer

### 7.1 API Architecture

```
┌────────────────────────────────────────┐
│          Express.js App                 │
├────────────────────────────────────────┤
│                                         │
│  Middleware Stack:                      │
│  1. morgan (Logging)                    │
│  2. helmet (Security headers)           │
│  3. cors (CORS handling)                │
│  4. express.json() (Body parsing)       │
│  5. rateLimit (Rate limiting)           │
│  6. authenticate (JWT verification)     │
│  7. validate (Input validation)         │
│                                         │
├────────────────────────────────────────┤
│                                         │
│  Routes:                                │
│  /api/v1/auth/*                         │
│  /api/v1/users/*                        │
│  /api/v1/recipes/*                      │
│  /api/v1/collections/*                  │
│  /api/v1/meal-plans/*                   │
│  /api/v1/shopping-lists/*               │
│  /api/v1/imports/*                      │
│  /api/v1/search/*                       │
│  /api/v1/utils/*                        │
│                                         │
├────────────────────────────────────────┤
│                                         │
│  Error Handler (Global)                 │
│                                         │
└────────────────────────────────────────┘
```

### 7.2 Request/Response Flow

```javascript
// Typical API endpoint structure

router.post('/recipes',
  authenticate,              // Middleware: Verify JWT
  validateRecipeInput,       // Middleware: Validate request body
  recipeController.create    // Controller: Handle request
);

// Controller
async function create(req, res, next) {
  try {
    const recipe = await recipeService.createRecipe(
      req.user.id,
      req.body
    );
    
    res.status(201).json({
      success: true,
      data: { recipe }
    });
  } catch (error) {
    next(error);  // Pass to error handler
  }
}

// Service
async function createRecipe(userId, recipeData) {
  // Business logic
  // Validation
  // Database operations
  return await prisma.recipe.create({
    data: {
      userId,
      ...recipeData
    }
  });
}
```

### 7.3 Authentication Middleware

```javascript
async function authenticate(req, res, next) {
  try {
    // 1. Extract token from header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new AuthError('No token provided');
    }
    
    // 2. Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Check token in Redis (session management)
    const sessionExists = await redis.exists(`session:${decoded.userId}:${decoded.sessionId}`);
    
    if (!sessionExists) {
      throw new AuthError('Session expired');
    }
    
    // 4. Load user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      throw new AuthError('User not found');
    }
    
    // 5. Attach user to request
    req.user = user;
    req.sessionId = decoded.sessionId;
    
    next();
  } catch (error) {
    next(error);
  }
}
```

---

## 8. Frontend Architecture

### 8.1 React Component Hierarchy

```
App
├── Layout
│   ├── Navbar
│   │   ├── Logo
│   │   ├── Navigation
│   │   ├── SearchBar
│   │   └── UserMenu
│   │
│   ├── Sidebar (optional, desktop)
│   │   ├── QuickLinks
│   │   ├── Collections
│   │   └── TagList
│   │
│   └── Main Content
│       └── Routes
│           ├── Home
│           │   ├── RecipeGrid
│           │   │   └── RecipeCard[]
│           │   ├── Filters
│           │   └── Pagination
│           │
│           ├── RecipeDetail
│           │   ├── RecipeHeader
│           │   ├── RecipeImage
│           │   ├── RecipeMetadata
│           │   ├── IngredientsList
│           │   ├── InstructionsList
│           │   └── RecipeActions
│           │
│           ├── MealPlanner
│           │   ├── Calendar
│           │   │   └── MealCard[]
│           │   └── RecipeSelector
│           │
│           └── ShoppingList
│               ├── ListHeader
│               └── ItemList
│                   └── ShoppingItem[]
│
└── Modals/Dialogs (Portal)
    ├── RecipeImport
    ├── CreateCollection
    └── AddToMealPlan
```

### 8.2 State Management Strategy

**Global State (Redux/Zustand)**:
- User authentication state
- Current user profile
- App-wide settings (theme, preferences)

**Server State (React Query)**:
- Recipes data
- Collections data
- Meal plans
- Shopping lists
- Cache management
- Automatic refetching

**Local State (useState)**:
- Form inputs
- UI toggles (modals, dropdowns)
- Component-specific state

```javascript
// Example: React Query for recipes

function useRecipes(filters) {
  return useQuery({
    queryKey: ['recipes', filters],
    queryFn: () => fetchRecipes(filters),
    staleTime: 5 * 60 * 1000,  // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Usage in component
function RecipesPage() {
  const { data, isLoading, error } = useRecipes({ tags: 'italian' });
  
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage />;
  
  return <RecipeGrid recipes={data.recipes} />;
}
```

### 8.3 Routing Structure

```javascript
<BrowserRouter>
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    
    {/* Protected routes */}
    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/recipes" element={<Recipes />} />
      <Route path="/recipes/:id" element={<RecipeDetail />} />
      <Route path="/recipes/new" element={<CreateRecipe />} />
      <Route path="/import" element={<ImportRecipe />} />
      <Route path="/collections" element={<Collections />} />
      <Route path="/collections/:id" element={<CollectionDetail />} />
      <Route path="/meal-plan" element={<MealPlanner />} />
      <Route path="/shopping-lists" element={<ShoppingLists />} />
      <Route path="/shopping-lists/:id" element={<ShoppingListDetail />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
    </Route>
    
    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

---

## 9. Security Architecture

### 9.1 Security Layers

```
┌────────────────────────────────────────┐
│  Layer 1: Network Security              │
│  • Firewall (UFW)                       │
│  • fail2ban (Intrusion prevention)      │
│  • DDoS protection                      │
└─────────────┬──────────────────────────┘
              │
┌─────────────▼──────────────────────────┐
│  Layer 2: Transport Security            │
│  • HTTPS/TLS 1.2+                       │
│  • SSL certificates                     │
│  • Secure headers (HSTS, CSP)           │
└─────────────┬──────────────────────────┘
              │
┌─────────────▼──────────────────────────┐
│  Layer 3: Application Security          │
│  • JWT authentication                   │
│  • Session management                   │
│  • Rate limiting                        │
│  • CORS policy                          │
└─────────────┬──────────────────────────┘
              │
┌─────────────▼──────────────────────────┐
│  Layer 4: Input Validation              │
│  • Request validation                   │
│  • SQL injection prevention             │
│  • XSS protection                       │
│  • CSRF tokens                          │
└─────────────┬──────────────────────────┘
              │
┌─────────────▼──────────────────────────┐
│  Layer 5: Data Security                 │
│  • Password hashing (bcrypt)            │
│  • Data encryption at rest              │
│  • User data isolation                  │
│  • Backup encryption                    │
└────────────────────────────────────────┘
```

### 9.2 Authentication Security

**JWT Token Structure**:
```javascript
{
  "userId": 123,
  "sessionId": "abc123",
  "email": "user@example.com",
  "iat": 1701780000,  // Issued at
  "exp": 1701866400   // Expires (24 hours)
}
```

**Token Management**:
- Access token: 24 hours expiration
- Refresh token: 7 days expiration
- Tokens stored in httpOnly cookies (alternative to localStorage)
- Session invalidation on logout

**Password Security**:
```javascript
// Password hashing
const hash = await bcrypt.hash(password, 10);  // 10 rounds

// Password verification
const isValid = await bcrypt.compare(password, hash);

// Password requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (optional)
```

### 9.3 Input Validation

```javascript
// Example validation middleware
const validateRecipeInput = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 500 })
    .escape(),
  
  body('prep_time')
    .optional()
    .isInt({ min: 0 })
    .toInt(),
  
  body('ingredients')
    .isArray({ min: 1 })
    .custom((ingredients) => {
      // Validate ingredient structure
      ingredients.forEach(ing => {
        if (!ing.name || typeof ing.name !== 'string') {
          throw new Error('Invalid ingredient structure');
        }
      });
      return true;
    }),
  
  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: errors.array()
        }
      });
    }
    next();
  }
];
```

### 9.4 Rate Limiting Strategy

```javascript
// Different rate limits for different endpoints
const rateLimits = {
  auth: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 5,                     // 5 requests
    message: 'Too many login attempts'
  },
  
  api: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    max: 1000,                  // 1000 requests
    message: 'Rate limit exceeded'
  },
  
  imports: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    max: 50,                    // 50 imports
    message: 'Import limit exceeded'
  }
};
```

---

## 10. Deployment Architecture

### 10.1 Server Architecture

```
┌────────────────────────────────────────────┐
│  Ubuntu 22.04 Server (<SERVER_IP>)         │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │        nginx (Port 80/443)           │  │
│  │  • Reverse proxy                     │  │
│  │  • SSL termination                   │  │
│  │  • Static file serving               │  │
│  │  • Load balancing ready              │  │
│  └───────┬──────────────────────────────┘  │
│          │                                 │
│          ├──> /api/* → Node.js (Port 3000) │
│          │                                 │
│          └──> /static/* → Static files     │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │      Node.js + PM2 (Port 3000)       │  │
│  │  • Express application               │  │
│  │  • Process manager                   │  │
│  │  • Auto-restart on crash             │  │
│  │  • Cluster mode (8 workers)          │  │
│  └───────┬──────────────────────────────┘  │
│          │                                 │
│  ┌───────▼──────────┐  ┌────────────────┐  │
│  │   PostgreSQL     │  │     Redis      │  │
│  │   (Port 5432)    │  │  (Port 6379)   │  │
│  │  • Primary DB    │  │  • Cache       │  │
│  │  • Recipes       │  │  • Sessions    │  │
│  │  • User data     │  │  • Rate limit  │  │
│  └──────────────────┘  └────────────────┘  │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │      File System Storage             │  │
│  │  /var/www/recipe-app/                │  │
│  │    ├── backend/                      │  │
│  │    ├── static/                       │  │
│  │    ├── uploads/                      │  │
│  │    ├── logs/                         │  │
│  │    └── backups/                      │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

### 10.2 Process Management with PM2

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'recipe-app',
    script: './server.js',
    instances: 'max',        // Use all CPU cores
    exec_mode: 'cluster',    // Cluster mode for load balancing
    max_memory_restart: '1G', // Restart if exceeds 1GB
    
    // Environment variables
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // Logging
    error_file: '/var/www/recipe-app/logs/error.log',
    out_file: '/var/www/recipe-app/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Auto-restart settings
    watch: false,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

### 10.3 nginx Configuration

```nginx
# /etc/nginx/sites-available/recipe-app

upstream backend {
    least_conn;  # Load balancing algorithm
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name <SERVER_IP>;
    
    # Redirect HTTP to HTTPS (after SSL setup)
    # return 301 https://$server_name$request_uri;
    
    # API requests
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Caching
        proxy_cache_bypass $http_upgrade;
        
        # File upload size
        client_max_body_size 10M;
    }
    
    # Static files (React build)
    location / {
        root /var/www/recipe-app/static;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, immutable";
    }
    
    # Uploaded files (recipe images)
    location /uploads/ {
        alias /var/www/recipe-app/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml+rss;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 10.4 Deployment Process

```bash
# Deployment script
#!/bin/bash

cd /var/www/recipe-app

# 1. Pull latest code
git pull origin main

# 2. Update backend dependencies
cd backend
npm ci  # Clean install from package-lock.json

# 3. Run database migrations
npm run migrate

# 4. Build frontend
cd ../frontend
npm ci
npm run build

# 5. Copy build to static directory
rm -rf ../static/*
cp -r build/* ../static/

# 6. Restart application
pm2 restart recipe-app

# 7. Verify deployment
sleep 5
curl -f http://localhost:3000/api/v1/health || exit 1

echo "Deployment successful!"
```

---

## 11. Scalability & Performance

### 11.1 Current Capacity

**Single Server Capacity** (with current hardware):
- Concurrent Users: 50-200
- Recipes: 100,000+
- API Requests: 1000/hour per user

### 11.2 Performance Optimization Strategies

**1. Database Level**:
- Connection pooling (20 connections)
- Proper indexing
- Query optimization
- Materialized views for complex queries

**2. Application Level**:
- Redis caching for frequently accessed data
- Response compression (gzip)
- Efficient algorithms (ingredient aggregation)
- Batch operations

**3. Frontend Level**:
- Code splitting (lazy loading)
- Image optimization (WebP, lazy load)
- Service Worker (PWA)
- Bundle optimization

**4. Network Level**:
- nginx caching
- Static file CDN (future)
- HTTP/2
- Keep-alive connections

### 11.3 Caching Strategy

```javascript
// Cache hierarchy
1. Browser Cache
   └─> Static assets (1 year)
   └─> API responses (React Query, 5 mins)

2. nginx Cache
   └─> Static files (1 hour)

3. Redis Cache
   └─> User data (15 mins)
   └─> Recipe lists (10 mins)
   └─> Individual recipes (30 mins)

4. Database Query Cache
   └─> Prepared statements
   └─> Query results (Prisma cache)
```

### 11.4 Future Scaling Options

**Horizontal Scaling**:
```
       ┌──> Load Balancer
       │
       ├──> App Server 1
       ├──> App Server 2
       └──> App Server 3
             │
             └──> Shared Database + Redis
```

**Database Scaling**:
- Read replicas for reports/analytics
- Sharding by user_id (if massive scale)
- Separate analytics database

**Storage Scaling**:
- Object storage (S3/MinIO) for images
- CDN for static assets

---

## 12. Integration Points

### 12.1 External Service Integrations

```
┌─────────────────────────────────────┐
│      Recipe App Backend             │
└───────┬─────────────────────────────┘
        │
        ├──> OpenAI API
        │    • Recipe parsing
        │    • Tag suggestions
        │    • Ingredient recognition
        │
        ├──> OCR Service
        │    • Tesseract.js (local)
        │    • OR Google Cloud Vision
        │    • OR Azure Computer Vision
        │
        ├──> SMTP Server
        │    • Password reset emails
        │    • Welcome emails
        │    • Notifications
        │
        └──> Web Scraping
             • Recipe websites
             • HTML parsing
             • Image extraction
```

### 12.2 Third-Party API Integration Pattern

```javascript
// Service abstraction for external APIs
class AIService {
  async parseRecipe(text) {
    try {
      // Primary: OpenAI
      return await this.openai.parseRecipe(text);
    } catch (error) {
      // Fallback: Local parsing
      return await this.localParser.parse(text);
    }
  }
}

// Configuration
const aiConfig = {
  provider: process.env.AI_PROVIDER || 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000,
  retries: 3
};
```

---

## Appendix A: Performance Metrics

### Target Performance Benchmarks

| Metric                  | Target  | Current | Notes            |
|-------------------------|---------|---------|------------------|
| Page Load (First Paint) | < 1.5s  | TBD     | Initial load     |
| Page Load (Interactive) | < 2s    | TBD     | Full interactivity |
| API Response (Read)     | < 200ms | TBD     | 95th percentile  |
| API Response (Write)    | < 500ms | TBD     | 95th percentile  |
| Recipe Import (URL)     | < 5s    | TBD     | Average          |
| OCR Processing          | < 10s   | TBD     | Per image        |
| Database Query          | < 100ms | TBD     | Most queries     |
| Uptime                  | 99.5%   | TBD     | Target SLA       |

---

## Appendix B: Error Handling Flow

```
Error occurs in application
         │
         ▼
┌────────────────────┐
│  Try-Catch Block   │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Error Handler      │
│ Middleware         │
│                    │
│ • Log error        │
│ • Determine type   │
│ • Format response  │
└────────┬───────────┘
         │
         ├──> Operational Error
         │    (e.g., validation)
         │    └─> Send 4xx response
         │
         └──> Programming Error
              (e.g., undefined)
              └─> Send 500 response
                  Log to file/Sentry
                  Alert admin
```

---

## Appendix C: Monitoring & Observability

### Logging Strategy

```
┌──────────────────────────────────────┐
│  Application Logs                     │
│  /var/www/recipe-app/logs/           │
│                                       │
│  • app.log - General application     │
│  • error.log - Errors only           │
│  • access.log - API access           │
│  • import.log - Import operations    │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  System Logs                          │
│                                       │
│  • /var/log/nginx/ - Web server      │
│  • /var/log/postgresql/ - Database   │
│  • PM2 logs - Process manager        │
└──────────────────────────────────────┘
```

### Monitoring Tools

- **PM2**: Process monitoring, CPU/memory usage
- **netdata**: Real-time performance monitoring
- **htop**: Interactive process viewer
- **Custom health endpoint**: `/api/v1/health`

---

**Document Version**: 1.0  
**Last Updated**: December 5, 2025  
**Architecture Status**: Ready for Implementation
