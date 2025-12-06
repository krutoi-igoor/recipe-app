# Recipe App - Development Requirements

## Executive Summary
This document outlines the technical specifications for building a web-based recipe management application. The application will support recipe import from multiple sources, AI-powered organization, meal planning, and shopping list generation.

**Target Platform**: Web application (responsive design)  
**Deployment**: Self-hosted Ubuntu server with nginx  
**Architecture**: Modern full-stack web application with RESTful API

---

## 1. Technology Stack

### 1.1 Frontend

**Framework**: React 18+
- Modern, component-based architecture
- Large ecosystem and community
- Excellent performance with Virtual DOM
- Rich library ecosystem

**State Management**: Redux Toolkit or Zustand
- Predictable state container
- DevTools for debugging
- Middleware support for async operations

**UI Framework**: Material-UI (MUI) or Tailwind CSS
- Pre-built, accessible components
- Customizable theming
- Responsive design utilities
- **Alternative**: Tailwind CSS for more custom designs

**Additional Libraries**:
- React Router (navigation)
- Axios (HTTP client)
- React Query (data fetching & caching)
- React Hook Form (form management)
- date-fns or Day.js (date manipulation)
- React DnD (drag-and-drop for meal planning)
- React-PDF or jsPDF (recipe export)

### 1.2 Backend

**Framework**: Node.js with Express.js
- JavaScript full-stack consistency
- Non-blocking I/O for performance
- Large ecosystem
- Easy deployment
- **Alternative**: Python with FastAPI (if prefer Python)

**ORM**: Prisma or TypeORM
- Type-safe database access
- Automatic migrations
- Database-agnostic
- Great developer experience

**Additional Libraries**:
- Passport.js or JWT (authentication)
- bcrypt (password hashing)
- express-validator (input validation)
- helmet (security headers)
- cors (CORS handling)
- morgan (logging)
- rate-limiter-flexible (rate limiting)

### 1.3 Database

**Primary Database**: PostgreSQL 14+
- Robust relational database
- JSONB support for flexible schemas
- Full-text search capabilities
- Excellent performance
- Strong data integrity

**Caching**: Redis
- Session storage
- API response caching
- Rate limiting storage
- Real-time features (pub/sub)

### 1.4 File Storage

**Strategy**: Local filesystem initially
- Recipe images stored on server
- Organized directory structure
- Future: S3-compatible storage (MinIO)

### 1.5 Web Server

**Server**: nginx
- High-performance reverse proxy
- Static file serving
- SSL/TLS termination
- Gzip compression
- Load balancing ready

### 1.6 Additional Services

**OCR**: Tesseract.js or Cloud OCR API
- Tesseract.js: Open-source, self-hosted
- Cloud alternatives: Google Cloud Vision, Azure Computer Vision

**AI/LLM**: OpenAI API or Local LLM
- OpenAI GPT-4 for recipe parsing and tagging
- Alternative: Ollama (self-hosted LLM)
- Use for: automatic tagging, recipe enhancement, parsing

**Web Scraping**: Cheerio or Puppeteer
- Cheerio: Fast, jQuery-like HTML parsing
- Puppeteer: For JavaScript-heavy sites
- Recipe Scrapers library (if using Python backend)

### 1.7 Development Tools

- **Version Control**: Git with GitHub/GitLab
- **Package Manager**: npm or yarn
- **Code Quality**: ESLint, Prettier
- **Testing**: Jest, React Testing Library, Supertest
- **API Documentation**: Swagger/OpenAPI
- **Monitoring**: PM2 (process manager), Winston (logging)

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                  │
│              React SPA with Material-UI              │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────┐
│                  nginx (Reverse Proxy)               │
│            SSL Termination, Static Files             │
└────────┬───────────────────────────────┬────────────┘
         │                               │
         │ /api/*                        │ /static/*
         ▼                               ▼
┌────────────────────┐          ┌──────────────────┐
│  Express.js API    │          │  Static Assets   │
│  Node.js Backend   │          │  (images, CSS)   │
└────────┬───────────┘          └──────────────────┘
         │
         ├─────────────┬─────────────┬───────────────┐
         ▼             ▼             ▼               ▼
┌────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ PostgreSQL │  │  Redis   │  │ AI APIs  │  │ OCR API  │
│  Database  │  │  Cache   │  │ (OpenAI) │  │          │
└────────────┘  └──────────┘  └──────────┘  └──────────┘
```

### 2.2 API Architecture

**Pattern**: RESTful API with JWT authentication

**Base URL**: `<SERVER_IP>/api/v1`

**Authentication**: Bearer token (JWT)

---

## 3. Database Schema

### 3.1 Core Tables

#### users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    preferences JSONB DEFAULT '{}'
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

#### recipes
```sql
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    source_url VARCHAR(1000),
    source_type VARCHAR(50), -- 'url', 'manual', 'image', 'video'
    image_url VARCHAR(500),
    prep_time INTEGER, -- minutes
    cook_time INTEGER, -- minutes
    total_time INTEGER, -- minutes
    servings INTEGER,
    difficulty VARCHAR(20), -- 'easy', 'medium', 'hard'
    cuisine VARCHAR(100),
    diet_type VARCHAR(50)[], -- ['vegetarian', 'gluten-free', etc.]
    ingredients JSONB NOT NULL, -- [{name, quantity, unit}, ...]
    instructions JSONB NOT NULL, -- [{step_number, instruction}, ...]
    notes TEXT,
    nutrition JSONB, -- {calories, protein, fat, carbs, etc.}
    tags VARCHAR(50)[],
    rating DECIMAL(3,2), -- user rating 0.00-5.00
    is_public BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    times_cooked INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_tags ON recipes USING GIN(tags);
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX idx_recipes_title ON recipes USING GIN(to_tsvector('english', title));
```

#### collections
```sql
CREATE TABLE collections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_collections_user_id ON collections(user_id);
```

#### recipe_collections
```sql
CREATE TABLE recipe_collections (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(recipe_id, collection_id)
);

CREATE INDEX idx_recipe_collections_recipe_id ON recipe_collections(recipe_id);
CREATE INDEX idx_recipe_collections_collection_id ON recipe_collections(collection_id);
```

#### meal_plans
```sql
CREATE TABLE meal_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE SET NULL,
    planned_date DATE NOT NULL,
    meal_type VARCHAR(20), -- 'breakfast', 'lunch', 'dinner', 'snack'
    servings INTEGER,
    notes TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX idx_meal_plans_date ON meal_plans(planned_date);
```

#### shopping_lists
```sql
CREATE TABLE shopping_lists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shopping_lists_user_id ON shopping_lists(user_id);
```

#### shopping_list_items
```sql
CREATE TABLE shopping_list_items (
    id SERIAL PRIMARY KEY,
    list_id INTEGER REFERENCES shopping_lists(id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE SET NULL,
    ingredient_name VARCHAR(200) NOT NULL,
    quantity DECIMAL(10,2),
    unit VARCHAR(50),
    category VARCHAR(100), -- 'produce', 'dairy', 'meat', etc.
    checked BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shopping_list_items_list_id ON shopping_list_items(list_id);
```

#### recipe_imports
```sql
CREATE TABLE recipe_imports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    source_url VARCHAR(1000),
    source_type VARCHAR(50),
    status VARCHAR(20), -- 'pending', 'processing', 'completed', 'failed'
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE SET NULL,
    error_message TEXT,
    raw_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_recipe_imports_user_id ON recipe_imports(user_id);
CREATE INDEX idx_recipe_imports_status ON recipe_imports(status);
```

#### user_sessions
```sql
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token_hash);
```

---

## 4. API Endpoints

### 4.1 Authentication Endpoints

```
POST   /api/v1/auth/register          Register new user
POST   /api/v1/auth/login             Login user
POST   /api/v1/auth/logout            Logout user
POST   /api/v1/auth/refresh           Refresh JWT token
POST   /api/v1/auth/forgot-password   Request password reset
POST   /api/v1/auth/reset-password    Reset password
GET    /api/v1/auth/verify-email      Verify email address
```

### 4.2 User Endpoints

```
GET    /api/v1/users/me               Get current user profile
PUT    /api/v1/users/me               Update current user profile
DELETE /api/v1/users/me               Delete user account
PUT    /api/v1/users/me/password      Change password
PUT    /api/v1/users/me/preferences   Update user preferences
GET    /api/v1/users/me/stats         Get user statistics
```

### 4.3 Recipe Endpoints

```
GET    /api/v1/recipes                List all recipes (paginated)
POST   /api/v1/recipes                Create new recipe
GET    /api/v1/recipes/:id            Get recipe by ID
PUT    /api/v1/recipes/:id            Update recipe
DELETE /api/v1/recipes/:id            Delete recipe
POST   /api/v1/recipes/:id/favorite   Toggle favorite
POST   /api/v1/recipes/:id/rate       Rate recipe
GET    /api/v1/recipes/:id/similar    Get similar recipes
POST   /api/v1/recipes/:id/scale      Scale recipe servings
POST   /api/v1/recipes/:id/export     Export recipe (PDF)
```

### 4.4 Recipe Import Endpoints

```
POST   /api/v1/imports/url            Import recipe from URL
POST   /api/v1/imports/image          Import recipe from image (OCR)
POST   /api/v1/imports/text           Import recipe from plain text
GET    /api/v1/imports/:id            Get import status
GET    /api/v1/imports                List import history
DELETE /api/v1/imports/:id            Delete import record
```

### 4.5 Collection Endpoints

```
GET    /api/v1/collections            List user collections
POST   /api/v1/collections            Create new collection
GET    /api/v1/collections/:id        Get collection details
PUT    /api/v1/collections/:id        Update collection
DELETE /api/v1/collections/:id        Delete collection
POST   /api/v1/collections/:id/recipes/:recipeId   Add recipe to collection
DELETE /api/v1/collections/:id/recipes/:recipeId   Remove recipe from collection
```

### 4.6 Meal Plan Endpoints

```
GET    /api/v1/meal-plans             Get meal plans (date range)
POST   /api/v1/meal-plans             Create meal plan entry
GET    /api/v1/meal-plans/:id         Get meal plan details
PUT    /api/v1/meal-plans/:id         Update meal plan
DELETE /api/v1/meal-plans/:id         Delete meal plan
POST   /api/v1/meal-plans/:id/complete  Mark meal as completed
GET    /api/v1/meal-plans/week        Get current week meal plan
```

### 4.7 Shopping List Endpoints

```
GET    /api/v1/shopping-lists         List all shopping lists
POST   /api/v1/shopping-lists         Create new shopping list
GET    /api/v1/shopping-lists/:id     Get shopping list
PUT    /api/v1/shopping-lists/:id     Update shopping list
DELETE /api/v1/shopping-lists/:id     Delete shopping list
POST   /api/v1/shopping-lists/:id/items          Add item
PUT    /api/v1/shopping-lists/:id/items/:itemId  Update item
DELETE /api/v1/shopping-lists/:id/items/:itemId  Delete item
POST   /api/v1/shopping-lists/:id/items/:itemId/check  Toggle check
POST   /api/v1/shopping-lists/from-meal-plan     Generate from meal plan
```

### 4.8 Search Endpoints

```
GET    /api/v1/search                 Search recipes
GET    /api/v1/search/autocomplete    Autocomplete suggestions
GET    /api/v1/search/ingredients     Search by ingredients
GET    /api/v1/search/tags            Get all available tags
```

### 4.9 Utility Endpoints

```
GET    /api/v1/utils/convert          Convert measurements
GET    /api/v1/utils/nutrition        Calculate nutrition
POST   /api/v1/utils/parse-ingredients  Parse ingredient text
GET    /api/v1/health                 Health check
```

---

## 5. Functional Requirements

### 5.1 User Authentication & Authorization

**Must Have:**
- User registration with email and password
- Email validation
- Secure password hashing (bcrypt, 10+ rounds)
- JWT-based authentication
- Session management
- Password reset via email
- Logout functionality

**Should Have:**
- Remember me functionality
- Multi-device session management
- Account deletion with data export

**Nice to Have:**
- OAuth2 (Google, Facebook login)
- Two-factor authentication
- Password strength requirements UI

### 5.2 Recipe Management

**Must Have:**
- Create recipes manually with:
  - Title, description
  - Ingredients (name, quantity, unit)
  - Instructions (step-by-step)
  - Prep/cook time, servings
  - Tags and categories
- Edit existing recipes
- Delete recipes (with confirmation)
- View recipe details
- Mark recipes as favorites
- Add personal notes to recipes
- Upload recipe images

**Should Have:**
- Recipe rating system (1-5 stars)
- Recipe scaling (adjust servings)
- Duplicate recipe
- Recipe versioning/history
- Print recipe view
- Export recipe to PDF
- Share recipe via link

**Nice to Have:**
- Recipe nutritional calculator
- Ingredient substitution suggestions
- Cooking timers integration
- Recipe comments/reviews
- Public recipe sharing

### 5.3 Recipe Import

**Must Have:**
- Import from URL (popular recipe sites)
- Parse structured recipe data
- Extract title, ingredients, instructions
- Handle import errors gracefully
- Show import preview before saving

**Should Have:**
- Import from image (OCR)
  - Handwritten recipes
  - Printed recipes
  - Recipe cards
- Batch URL import
- Import queue with status tracking
- Manual correction interface for OCR

**Nice to Have:**
- Import from video (YouTube, TikTok)
- Import from social media posts
- Browser extension for one-click import
- Email import (forward recipe to app)

### 5.4 Recipe Organization

**Must Have:**
- Full-text search across recipes
- Filter by:
  - Tags
  - Cooking time
  - Difficulty
  - Favorites
- Sort by date, name, rating
- Create custom collections/folders
- Add recipes to multiple collections

**Should Have:**
- Advanced search filters:
  - Ingredients (include/exclude)
  - Cuisine type
  - Dietary restrictions
  - Prep time range
- Automatic categorization suggestions
- Tag management (rename, merge, delete)
- Recently viewed recipes

**Nice to Have:**
- Semantic/AI-powered search
- Similar recipe suggestions
- Recipe recommendations
- Smart collections (auto-populated by rules)

### 5.5 AI Features

**Must Have:**
- Automatic tag suggestions for imported recipes
- Recipe parsing from unstructured text
- Basic ingredient parsing (quantity, unit, item)

**Should Have:**
- Recipe categorization (cuisine, diet type)
- Missing information inference
- Recipe quality scoring
- Duplicate recipe detection
- Smart ingredient matching

**Nice to Have:**
- Personalized recipe recommendations
- Recipe generation from ingredients
- Nutritional analysis
- Cooking tip suggestions
- Recipe improvement suggestions

### 5.6 Meal Planning

**Must Have:**
- Weekly calendar view
- Add recipes to specific dates/meals
- View meal plan for week/month
- Edit and remove planned meals
- Basic meal types (breakfast, lunch, dinner)

**Should Have:**
- Drag-and-drop meal planning
- Copy week to next week
- Meal plan templates
- Notes for each meal
- Serving size adjustments per meal
- Mark meals as completed

**Nice to Have:**
- Meal plan sharing with household
- Meal prep planning (batch cooking)
- Leftover tracking
- Nutritional summary for week
- Budget tracking per meal plan

### 5.7 Shopping Lists

**Must Have:**
- Create shopping lists
- Add items manually
- Auto-generate list from meal plan
- Check/uncheck items
- Edit item quantities
- Delete items
- Categorize items (produce, dairy, etc.)

**Should Have:**
- Multiple shopping lists
- Ingredient aggregation (combine duplicates)
- Share list with others
- Print shopping list
- Sort by category/aisle
- Clear checked items

**Nice to Have:**
- Real-time collaborative lists
- Store-specific aisle sorting
- Price tracking
- Recipe-to-list mapping
- Voice input for items
- Barcode scanning

### 5.8 User Experience

**Must Have:**
- Responsive design (mobile, tablet, desktop)
- Fast page loads (< 2 seconds)
- Clear error messages
- Form validation
- Loading indicators
- Intuitive navigation

**Should Have:**
- Dark mode
- Keyboard shortcuts
- Offline support (PWA)
- Recipe image optimization
- Infinite scroll/pagination
- Undo actions
- Breadcrumb navigation

**Nice to Have:**
- Accessibility (WCAG 2.1 AA)
- Multiple language support
- Customizable themes
- Tutorial/onboarding
- Contextual help
- Voice commands

---

## 6. Non-Functional Requirements

### 6.1 Performance

- **Page Load Time**: < 2 seconds for initial load
- **API Response Time**: < 200ms (95th percentile)
- **Database Queries**: < 100ms for most operations
- **Image Loading**: Lazy loading, optimized sizes
- **Concurrent Users**: Support 50+ simultaneous users
- **Recipe Import**: < 5 seconds for URL import
- **OCR Processing**: < 10 seconds per image

### 6.2 Scalability

- Horizontal scaling capability via load balancer
- Database connection pooling
- Redis caching for frequently accessed data
- Stateless API design (JWT tokens)
- CDN-ready static assets
- Optimized database indexes

### 6.3 Security

**Authentication & Authorization:**
- HTTPS only (SSL/TLS 1.2+)
- JWT tokens with reasonable expiration (1-24 hours)
- Refresh token mechanism
- Password hashing with bcrypt (10+ rounds)
- Rate limiting on authentication endpoints
- CSRF protection
- XSS protection (input sanitization)
- SQL injection prevention (parameterized queries)

**Data Protection:**
- User data isolation (users only see their own data)
- Secure session management
- Encrypted database passwords
- No sensitive data in logs
- Regular security updates

**Infrastructure:**
- Firewall configuration
- Regular security audits
- Dependency vulnerability scanning
- Backup encryption
- Limited API access (CORS configuration)

### 6.4 Reliability

- **Uptime Target**: 99.5% (< 3.7 hours downtime/month)
- Automated daily database backups
- Error logging and monitoring
- Graceful error handling (no crashes)
- Database transaction support
- Rollback capabilities for migrations

### 6.5 Maintainability

- Clean, documented code
- Modular architecture
- Comprehensive test coverage (80%+)
- API documentation (Swagger)
- Version control with meaningful commits
- Deployment automation
- Environment-based configuration
- Standardized code style (ESLint/Prettier)

### 6.6 Usability

- Intuitive interface (minimal learning curve)
- Consistent design patterns
- Mobile-friendly touch targets (44x44px minimum)
- Clear visual feedback
- Helpful error messages
- Keyboard navigation support
- Screen reader compatibility

### 6.7 Compatibility

**Browsers:**
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari (iOS 13+)
- Chrome Mobile (Android 8+)

**Devices:**
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

**Server:**
- Ubuntu 20.04 LTS or newer
- Node.js 18+ LTS
- PostgreSQL 14+
- Redis 6+
- nginx 1.18+

---

## 7. User Stories & Acceptance Criteria

### 7.1 As a new user, I want to create an account
**Acceptance Criteria:**
- User can register with email and password
- Email validation is enforced
- Password must meet minimum requirements (8+ chars)
- Duplicate emails are rejected with clear message
- User receives confirmation email
- User is automatically logged in after registration

### 7.2 As a user, I want to import a recipe from a URL
**Acceptance Criteria:**
- User can paste a recipe URL
- System extracts title, ingredients, and instructions
- System shows preview before saving
- User can edit extracted data
- Recipe is saved to user's library
- User sees success/error message
- Failed imports are logged for debugging

### 7.3 As a user, I want to organize recipes into collections
**Acceptance Criteria:**
- User can create named collections
- User can add/remove recipes from collections
- Recipe can belong to multiple collections
- Collections are displayed in sidebar/menu
- User can rename/delete collections
- Empty collections are handled gracefully

### 7.4 As a user, I want to plan meals for the week
**Acceptance Criteria:**
- User sees weekly calendar view
- User can add recipes to specific days/meals
- User can drag-and-drop recipes (optional)
- User can remove recipes from meal plan
- User can view recipe details from meal plan
- Changes are saved automatically

### 7.5 As a user, I want to generate a shopping list from my meal plan
**Acceptance Criteria:**
- User can generate list from date range
- Ingredients from multiple recipes are combined
- User can manually add/edit items
- User can check off items as they shop
- User can categorize items
- List is saved and accessible across devices

### 7.6 As a user, I want to search for recipes
**Acceptance Criteria:**
- User can search by recipe name
- Search returns results as user types
- User can filter by tags, time, difficulty
- Search is fast (< 300ms)
- Results show relevant recipe info
- No results shows helpful message

### 7.7 As a user, I want to upload a photo of a handwritten recipe
**Acceptance Criteria:**
- User can upload image file
- System extracts text via OCR
- System attempts to structure data (title, ingredients, steps)
- User can review and edit extracted text
- User can save as recipe
- OCR accuracy is reasonable (80%+)

### 7.8 As a user, I want my recipes to sync across devices
**Acceptance Criteria:**
- Changes made on one device appear on others
- Sync happens automatically (no manual action)
- Conflicts are handled (last write wins)
- User sees loading indicator during sync
- Offline changes sync when back online

---

## 8. Data Flow Examples

### 8.1 Recipe Import from URL

```
1. User pastes URL into import form
2. Frontend sends POST request to /api/v1/imports/url
3. Backend:
   a. Validates URL format
   b. Fetches HTML content
   c. Parses HTML for recipe schema or common patterns
   d. Extracts recipe data (title, ingredients, instructions)
   e. Sends to AI service for cleanup/enhancement (optional)
   f. Returns structured recipe JSON
4. Frontend displays preview
5. User reviews and edits
6. User clicks "Save"
7. Frontend sends POST to /api/v1/recipes
8. Backend saves to database
9. Frontend shows success message and redirects to recipe
```

### 8.2 OCR Recipe Import

```
1. User uploads image file
2. Frontend validates file type and size
3. Frontend uploads to /api/v1/imports/image
4. Backend:
   a. Saves image temporarily
   b. Sends to OCR service (Tesseract or Cloud API)
   c. Receives text extraction
   d. Sends text to AI for recipe parsing
   e. Structures into recipe format
   f. Returns structured data
5. Frontend shows extracted recipe with editable fields
6. User corrects errors
7. User saves recipe
8. Backend saves to database with source_type='image'
```

### 8.3 Meal Plan to Shopping List

```
1. User clicks "Generate Shopping List" from meal plan
2. Frontend sends date range to backend
3. Backend:
   a. Queries meal_plans for date range
   b. Retrieves associated recipes
   c. Extracts all ingredients
   d. Aggregates duplicate ingredients (1 cup milk + 2 cups milk = 3 cups milk)
   e. Categorizes ingredients
   f. Creates shopping_list and shopping_list_items
   g. Returns shopping list ID
4. Frontend navigates to shopping list view
5. User can check off items as they shop
6. Frontend sends PUT requests to update item.checked status
```

---

## 9. API Request/Response Examples

### 9.1 User Login

**Request:**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (Success):**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "email": "user@example.com",
      "username": "johndoe",
      "first_name": "John",
      "last_name": "Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

### 9.2 Get Recipes (Paginated)

**Request:**
```http
GET /api/v1/recipes?page=1&limit=20&tags=italian,pasta&sort=created_at:desc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "recipes": [
      {
        "id": 456,
        "title": "Spaghetti Carbonara",
        "description": "Classic Roman pasta dish",
        "image_url": "/uploads/recipes/456.jpg",
        "prep_time": 10,
        "cook_time": 15,
        "total_time": 25,
        "servings": 4,
        "tags": ["italian", "pasta", "quick"],
        "is_favorite": true,
        "rating": 4.5,
        "created_at": "2025-12-01T10:30:00Z"
      }
      // ... more recipes
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### 9.3 Create Recipe

**Request:**
```http
POST /api/v1/recipes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Chocolate Chip Cookies",
  "description": "Classic homemade cookies",
  "prep_time": 15,
  "cook_time": 12,
  "servings": 24,
  "difficulty": "easy",
  "ingredients": [
    {
      "name": "all-purpose flour",
      "quantity": 2.25,
      "unit": "cups"
    },
    {
      "name": "butter",
      "quantity": 1,
      "unit": "cup"
    },
    {
      "name": "chocolate chips",
      "quantity": 2,
      "unit": "cups"
    }
  ],
  "instructions": [
    {
      "step_number": 1,
      "instruction": "Preheat oven to 375°F"
    },
    {
      "step_number": 2,
      "instruction": "Mix butter and sugars until creamy"
    }
  ],
  "tags": ["dessert", "cookies", "baking"]
}
```

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "data": {
    "recipe": {
      "id": 789,
      "title": "Chocolate Chip Cookies",
      // ... full recipe object
      "created_at": "2025-12-05T14:22:00Z"
    }
  }
}
```

### 9.4 Import Recipe from URL

**Request:**
```http
POST /api/v1/imports/url
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "url": "https://www.allrecipes.com/recipe/12345/amazing-cake/"
}
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "import_id": 999,
    "recipe": {
      "title": "Amazing Cake",
      "description": "A delicious cake recipe",
      "source_url": "https://www.allrecipes.com/recipe/12345/amazing-cake/",
      "image_url": "https://www.allrecipes.com/images/cake.jpg",
      "prep_time": 20,
      "cook_time": 35,
      "servings": 8,
      "ingredients": [/* ... */],
      "instructions": [/* ... */],
      "tags": ["dessert", "cake"]
    }
  }
}
```

---

## 10. Error Handling

### 10.1 Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### 10.2 HTTP Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `204 No Content`: Successful request with no response body
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Authenticated but not authorized
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource (e.g., email already exists)
- `422 Unprocessable Entity`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Maintenance or overload

### 10.3 Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `AUTH_REQUIRED`: Authentication token missing
- `AUTH_INVALID`: Invalid or expired token
- `AUTH_FAILED`: Invalid credentials
- `NOT_FOUND`: Resource not found
- `DUPLICATE`: Resource already exists
- `FORBIDDEN`: Insufficient permissions
- `RATE_LIMIT`: Too many requests
- `IMPORT_FAILED`: Recipe import failed
- `OCR_FAILED`: Image text extraction failed
- `SERVER_ERROR`: Internal server error

---

## 11. Testing Requirements

### 11.1 Unit Tests

- All utility functions
- All API route handlers
- Database models and methods
- Authentication logic
- Recipe parsing logic
- Ingredient aggregation logic
- **Target Coverage**: 80%+

### 11.2 Integration Tests

- API endpoint flows
- Database operations
- Authentication flows
- File upload handling
- External API integrations

### 11.3 End-to-End Tests

- User registration and login
- Recipe creation and editing
- Recipe import from URL
- Meal planning workflow
- Shopping list generation
- Search functionality

### 11.4 Performance Tests

- Load testing (50+ concurrent users)
- API response time benchmarks
- Database query optimization
- Large dataset handling

### 11.5 Security Tests

- SQL injection attempts
- XSS attack prevention
- CSRF protection
- Authentication bypass attempts
- Rate limiting effectiveness

---

## 12. Deployment Requirements

### 12.1 Environment Variables

```bash
# Application
NODE_ENV=production
PORT=3000
API_BASE_URL=<SERVER_IP>/api/v1

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/recipe_app
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=<strong-random-secret>
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=<strong-random-secret>
JWT_REFRESH_EXPIRATION=7d

# File Upload
UPLOAD_DIR=/var/www/recipe-app/uploads
MAX_FILE_SIZE=10485760  # 10MB

# AI Services
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4

# OCR
OCR_SERVICE=tesseract  # or 'google', 'azure'
GOOGLE_CLOUD_API_KEY=
AZURE_COMPUTER_VISION_KEY=

# Email (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=noreply@recipe-app.com

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=  # optional
```

### 12.2 Server Requirements

- Ubuntu 20.04 LTS or newer
- 2GB+ RAM (4GB recommended)
- 20GB+ storage
- Node.js 18+ LTS
- PostgreSQL 14+
- Redis 6+
- nginx 1.18+
- SSL certificate (Let's Encrypt)

### 12.3 Deployment Checklist

- [ ] Server provisioned and accessible
- [ ] SSH access configured
- [ ] Firewall configured (ports 22, 80, 443)
- [ ] nginx installed and configured
- [ ] SSL certificate installed
- [ ] PostgreSQL installed and secured
- [ ] Redis installed
- [ ] Node.js installed
- [ ] Application code deployed
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Static assets built
- [ ] PM2 or systemd service configured
- [ ] Automated backups configured
- [ ] Monitoring set up
- [ ] Log rotation configured

---

## 13. Future Enhancements (Post-MVP)

### Phase 2 Features
- Mobile apps (React Native)
- Recipe video support
- Social features (follow users, share publicly)
- Recipe comments and ratings from others
- Advanced nutritional analysis
- Dietary restriction filters
- Multi-language support

### Phase 3 Features
- Voice control integration
- Smart appliance integration
- Grocery delivery integration
- Recipe recommendations based on AI
- Meal prep planning tools
- Budget tracking per recipe
- Cooking mode with step-by-step guidance

---

## 14. Open Questions & Decisions Needed

1. **AI Service Choice**: OpenAI API vs. self-hosted LLM (Ollama)?
   - Cost vs. control tradeoff
   
2. **OCR Service**: Tesseract (free, self-hosted) vs. Cloud APIs (Google/Azure)?
   - Accuracy vs. cost consideration

3. **Image Storage**: Local filesystem vs. S3-compatible storage (MinIO)?
   - Starting with local, migrate later?

4. **Email Service**: Self-hosted SMTP vs. SendGrid/Mailgun?
   - For password reset emails

5. **Frontend Build**: Single Page App vs. Server-Side Rendering?
   - SPA recommended for interactivity

6. **Database Backups**: Daily automated backups sufficient?
   - Backup retention policy?

7. **User Limits**: Any limits on recipes per user, imports per day?
   - To prevent abuse

8. **Public Recipe Sharing**: Allow users to share recipes publicly?
   - Impact on moderation needs

---

## 15. Success Metrics (Post-Launch)

### Technical Metrics
- API uptime: > 99.5%
- Average response time: < 200ms
- Error rate: < 0.1%
- Test coverage: > 80%

### User Metrics
- Recipe import success rate: > 90%
- User retention (30-day): > 60%
- Average recipes per user: > 20
- Daily active users: Steady growth

### Business Metrics
- User registration rate
- Feature adoption (meal planning, shopping lists)
- User feedback score: > 4/5 stars

---

## Version History

| Version | Date        | Author           | Changes                       |
|---------|-------------|------------------|-------------------------------|  
| 1.0     | Dec 5, 2025 | Development Team | Initial requirements document |---

## Approval

This document should be reviewed and approved by:
- [ ] Project Owner
- [ ] Lead Developer
- [ ] DevOps Engineer
- [ ] QA Lead

**Next Steps**: 
1. Review and approve requirements
2. Assess hosting server capabilities
3. Begin Phase 1 setup tasks
