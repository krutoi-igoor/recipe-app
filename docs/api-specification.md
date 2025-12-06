# Recipe App - API Specification

## Document Information
**Version**: 1.0  
**Last Updated**: December 5, 2025  
**Base URL**: `<SERVER_IP>/api/v1`  
**Protocol**: HTTP/HTTPS  
**Data Format**: JSON  
**Authentication**: JWT (JSON Web Tokens)

---

## Table of Contents
1. [Overview](#1-overview)
2. [Authentication](#2-authentication)
3. [Common Patterns](#3-common-patterns)
4. [Error Handling](#4-error-handling)
5. [Rate Limiting](#5-rate-limiting)
6. [API Endpoints](#6-api-endpoints)
7. [Data Models](#7-data-models)
8. [Webhooks](#8-webhooks)
9. [API Versioning](#9-api-versioning)
10. [Examples](#10-examples)

---

## 1. Overview

### 1.1 API Philosophy
The Recipe App API follows RESTful principles with:
- Resource-based URLs
- Standard HTTP methods (GET, POST, PUT, DELETE, PATCH)
- JSON request/response bodies
- Stateless authentication via JWT
- Predictable error responses
- Pagination for list endpoints

### 1.2 Base URL Structure
```
http://<SERVER_IP>/api/v1/{resource}
```

### 1.3 Content Types
```
Request:  Content-Type: application/json
Response: Content-Type: application/json; charset=utf-8
```

### 1.4 HTTP Methods
- **GET**: Retrieve resources (idempotent)
- **POST**: Create new resources
- **PUT**: Update entire resource (idempotent)
- **PATCH**: Partial update of resource
- **DELETE**: Remove resource (idempotent)

---

## 2. Authentication

### 2.1 Authentication Flow

#### Registration
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "email": "user@example.com",
      "username": "johndoe",
      "first_name": "John",
      "last_name": "Doe",
      "created_at": "2025-12-05T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400
  }
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "email": "user@example.com",
      "username": "johndoe",
      "last_login": "2025-12-05T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400
  }
}
```

### 2.2 Token Usage

All authenticated endpoints require the JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.3 Token Refresh

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400
  }
}
```

### 2.4 Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

### 2.5 Password Reset

**Request Reset:**
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

**Reset Password:**
```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "new_password": "NewSecurePass123!"
}
```

---

## 3. Common Patterns

### 3.1 Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Example:**
```http
GET /api/v1/recipes?page=2&limit=20
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 2,
      "limit": 20,
      "total": 156,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": true
    }
  }
}
```

### 3.2 Filtering

**Query Parameters:**
- `tags`: Filter by tags (comma-separated)
- `cuisine`: Filter by cuisine type
- `difficulty`: Filter by difficulty (easy, medium, hard)
- `prep_time`: Maximum prep time in minutes
- `cook_time`: Maximum cook time in minutes
- `favorites`: Show only favorites (true/false)

**Example:**
```http
GET /api/v1/recipes?tags=italian,pasta&difficulty=easy&prep_time=30
```

### 3.3 Sorting

**Query Parameter:**
- `sort`: Field to sort by, prefix with `-` for descending

**Examples:**
```http
GET /api/v1/recipes?sort=-created_at        # Newest first
GET /api/v1/recipes?sort=title              # A-Z
GET /api/v1/recipes?sort=-rating            # Highest rated first
```

### 3.4 Field Selection

Request only specific fields:

```http
GET /api/v1/recipes?fields=id,title,image_url,prep_time
```

### 3.5 Search

**Query Parameter:**
- `q`: Search query (searches title, description, ingredients)

```http
GET /api/v1/recipes?q=chocolate+cake
```

---

## 4. Error Handling

### 4.1 Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [
      {
        "field": "email",
        "message": "Email is already in use"
      }
    ],
    "timestamp": "2025-12-05T10:30:00Z",
    "path": "/api/v1/auth/register"
  }
}
```

### 4.2 HTTP Status Codes

| Code | Meaning               | When to Use                             |
|------|-----------------------|-----------------------------------------|
| 200  | OK                    | Successful GET, PUT, PATCH, DELETE      |
| 201  | Created               | Successful POST (resource created)      |
| 204  | No Content            | Successful DELETE with no response body |
| 400  | Bad Request           | Invalid request data                    |
| 401  | Unauthorized          | Missing or invalid authentication       |
| 403  | Forbidden             | Authenticated but not authorized        |
| 404  | Not Found             | Resource doesn't exist                  |
| 409  | Conflict              | Duplicate resource (email, username)    |
| 422  | Unprocessable Entity  | Validation error                        |
| 429  | Too Many Requests     | Rate limit exceeded                     |
| 500  | Internal Server Error | Server error                            |
| 503  | Service Unavailable   | Temporary server issue                  |

### 4.3 Error Codes

| Code                  | HTTP Status | Description                      |
|-----------------------|-------------|----------------------------------|
| `VALIDATION_ERROR`    | 422         | Input validation failed          |
| `AUTH_REQUIRED`       | 401         | Authentication token missing     |
| `AUTH_INVALID`        | 401         | Invalid or expired token         |
| `AUTH_FAILED`         | 401         | Invalid credentials              |
| `FORBIDDEN`           | 403         | Insufficient permissions         |
| `NOT_FOUND`           | 404         | Resource not found               |
| `DUPLICATE`           | 409         | Resource already exists          |
| `RATE_LIMIT`          | 429         | Too many requests                |
| `IMPORT_FAILED`       | 422         | Recipe import failed             |
| `OCR_FAILED`          | 422         | Image text extraction failed     |
| `INVALID_FILE`        | 400         | Invalid file type or size        |
| `SERVER_ERROR`        | 500         | Internal server error            |
| `SERVICE_UNAVAILABLE` | 503         | Service temporarily unavailable  |

### 4.4 Validation Errors

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
}
```

---

## 5. Rate Limiting

### 5.1 Rate Limit Rules

| Endpoint Pattern                  | Rate Limit     | Window     |
|-----------------------------------|----------------|------------|
| `/api/v1/auth/login`              | 5 requests     | 15 minutes |
| `/api/v1/auth/register`           | 3 requests     | 1 hour     |
| `/api/v1/auth/forgot-password`    | 3 requests     | 1 hour     |
| `/api/v1/imports/*`               | 50 requests    | 1 hour     |
| All other authenticated endpoints | 1000 requests  | 1 hour     |
| Public endpoints                  | 100 requests   | 1 hour     |

### 5.2 Rate Limit Headers

Every response includes rate limit headers:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1701780000
```

### 5.3 Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT",
    "message": "Rate limit exceeded. Try again in 45 minutes.",
    "retry_after": 2700
  }
}
```

---

## 6. API Endpoints

### 6.1 Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Validation:**
- `email`: Required, valid email format, unique
- `password`: Required, min 8 chars, must contain uppercase, lowercase, number
- `username`: Required, 3-30 chars, alphanumeric + underscore, unique
- `first_name`: Optional, max 100 chars
- `last_name`: Optional, max 100 chars

**Response:** 201 Created (see section 2.1)

#### POST /auth/login
Authenticate and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** 200 OK (see section 2.1)

#### POST /auth/logout
Invalidate current session token.

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK

#### POST /auth/refresh
Get new access token using refresh token.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** 200 OK (see section 2.3)

---

### 6.2 User Endpoints

#### GET /users/me
Get current user profile.

**Headers:** `Authorization: Bearer {token}`

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "email": "user@example.com",
      "username": "johndoe",
      "first_name": "John",
      "last_name": "Doe",
      "avatar_url": "/uploads/avatars/123.jpg",
      "created_at": "2025-11-01T10:00:00Z",
      "last_login": "2025-12-05T10:30:00Z",
      "preferences": {
        "theme": "light",
        "default_servings": 4,
        "measurement_system": "metric"
      }
    }
  }
}
```

#### PUT /users/me
Update current user profile.

**Request:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "preferences": {
    "theme": "dark",
    "default_servings": 2
  }
}
```

**Response:** 200 OK (returns updated user object)

#### PUT /users/me/password
Change user password.

**Request:**
```json
{
  "current_password": "OldPass123!",
  "new_password": "NewSecurePass456!"
}
```

**Response:** 200 OK

#### DELETE /users/me
Delete user account and all associated data.

**Request:**
```json
{
  "password": "SecurePass123!",
  "confirm": true
}
```

**Response:** 204 No Content

#### GET /users/me/stats
Get user statistics.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_recipes": 156,
      "favorite_recipes": 23,
      "collections": 8,
      "recipes_cooked": 42,
      "recipes_imported": 89,
      "recipes_created": 67,
      "total_meal_plans": 120
    }
  }
}
```

---

### 6.3 Recipe Endpoints

#### GET /recipes
List all recipes for authenticated user.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `q`: Search query
- `tags`: Filter by tags (comma-separated)
- `cuisine`: Filter by cuisine
- `difficulty`: Filter by difficulty
- `prep_time`: Max prep time (minutes)
- `cook_time`: Max cook time (minutes)
- `favorites`: Boolean
- `sort`: Sort field (e.g., `-created_at`, `title`, `-rating`)

**Example:**
```http
GET /api/v1/recipes?page=1&limit=20&tags=italian&sort=-created_at
```

**Response:** 200 OK
```json
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
        "difficulty": "easy",
        "cuisine": "Italian",
        "tags": ["italian", "pasta", "quick"],
        "is_favorite": true,
        "rating": 4.5,
        "times_cooked": 12,
        "created_at": "2025-11-15T14:20:00Z",
        "updated_at": "2025-12-01T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### POST /recipes
Create a new recipe.

**Request:**
```json
{
  "title": "Chocolate Chip Cookies",
  "description": "Classic homemade cookies that everyone loves",
  "prep_time": 15,
  "cook_time": 12,
  "servings": 24,
  "difficulty": "easy",
  "cuisine": "American",
  "diet_type": ["vegetarian"],
  "ingredients": [
    {
      "name": "all-purpose flour",
      "quantity": 2.25,
      "unit": "cups"
    },
    {
      "name": "butter",
      "quantity": 1,
      "unit": "cup",
      "notes": "softened"
    },
    {
      "name": "chocolate chips",
      "quantity": 2,
      "unit": "cups"
    },
    {
      "name": "eggs",
      "quantity": 2,
      "unit": "large"
    }
  ],
  "instructions": [
    {
      "step_number": 1,
      "instruction": "Preheat oven to 375°F (190°C)."
    },
    {
      "step_number": 2,
      "instruction": "Mix butter and sugars until creamy."
    },
    {
      "step_number": 3,
      "instruction": "Beat in eggs and vanilla."
    }
  ],
  "notes": "These freeze well for up to 3 months.",
  "tags": ["dessert", "cookies", "baking"]
}
```

**Validation:**
- `title`: Required, 1-500 chars
- `prep_time`: Optional, integer >= 0
- `cook_time`: Optional, integer >= 0
- `servings`: Optional, integer > 0
- `difficulty`: Optional, enum: easy|medium|hard
- `ingredients`: Required, array with at least 1 item
- `instructions`: Required, array with at least 1 item

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "recipe": {
      "id": 789,
      "title": "Chocolate Chip Cookies",
      "description": "Classic homemade cookies that everyone loves",
      "prep_time": 15,
      "cook_time": 12,
      "total_time": 27,
      "servings": 24,
      "difficulty": "easy",
      "cuisine": "American",
      "diet_type": ["vegetarian"],
      "ingredients": [...],
      "instructions": [...],
      "notes": "These freeze well for up to 3 months.",
      "tags": ["dessert", "cookies", "baking"],
      "is_favorite": false,
      "rating": null,
      "times_cooked": 0,
      "created_at": "2025-12-05T15:30:00Z",
      "updated_at": "2025-12-05T15:30:00Z"
    }
  }
}
```

#### GET /recipes/:id
Get a single recipe by ID.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "recipe": {
      "id": 456,
      "user_id": 123,
      "title": "Spaghetti Carbonara",
      "description": "Classic Roman pasta dish with eggs, cheese, and pancetta",
      "source_url": "https://example.com/recipe",
      "source_type": "url",
      "image_url": "/uploads/recipes/456.jpg",
      "prep_time": 10,
      "cook_time": 15,
      "total_time": 25,
      "servings": 4,
      "difficulty": "easy",
      "cuisine": "Italian",
      "diet_type": [],
      "ingredients": [
        {
          "name": "spaghetti",
          "quantity": 400,
          "unit": "g"
        },
        {
          "name": "pancetta",
          "quantity": 150,
          "unit": "g",
          "notes": "diced"
        }
      ],
      "instructions": [
        {
          "step_number": 1,
          "instruction": "Cook spaghetti according to package directions."
        },
        {
          "step_number": 2,
          "instruction": "Fry pancetta until crispy."
        }
      ],
      "notes": "Save pasta water for sauce!",
      "nutrition": {
        "calories": 520,
        "protein": 22,
        "fat": 18,
        "carbs": 65
      },
      "tags": ["italian", "pasta", "quick", "dinner"],
      "rating": 4.5,
      "is_favorite": true,
      "is_public": false,
      "times_cooked": 12,
      "created_at": "2025-11-15T14:20:00Z",
      "updated_at": "2025-12-01T10:30:00Z"
    }
  }
}
```

#### PUT /recipes/:id
Update entire recipe.

**Request:** Same format as POST /recipes

**Response:** 200 OK (returns updated recipe)

#### PATCH /recipes/:id
Partially update recipe.

**Request:**
```json
{
  "rating": 5.0,
  "is_favorite": true,
  "notes": "Updated notes"
}
```

**Response:** 200 OK (returns updated recipe)

#### DELETE /recipes/:id
Delete a recipe.

**Response:** 204 No Content

#### POST /recipes/:id/favorite
Toggle recipe favorite status.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "is_favorite": true
  }
}
```

#### POST /recipes/:id/rate
Rate a recipe.

**Request:**
```json
{
  "rating": 4.5
}
```

**Validation:**
- `rating`: Required, number 0.0-5.0

**Response:** 200 OK

#### POST /recipes/:id/cooked
Increment times cooked counter.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "times_cooked": 13
  }
}
```

#### GET /recipes/:id/similar
Get similar recipes based on tags and ingredients.

**Query Parameters:**
- `limit`: Number of results (default: 5, max: 20)

**Response:** 200 OK (returns array of recipe summaries)

#### POST /recipes/:id/scale
Scale recipe servings.

**Request:**
```json
{
  "servings": 8
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "scaled_recipe": {
      "original_servings": 4,
      "new_servings": 8,
      "scale_factor": 2,
      "ingredients": [
        {
          "name": "spaghetti",
          "quantity": 800,
          "unit": "g"
        }
      ]
    }
  }
}
```

#### POST /recipes/:id/export
Export recipe to PDF.

**Request:**
```json
{
  "format": "pdf",
  "include_notes": true,
  "include_nutrition": true
}
```

**Response:** 200 OK (PDF file download)

---

### 6.4 Recipe Import Endpoints

#### POST /imports/url
Import recipe from URL.

**Request:**
```json
{
  "url": "https://www.allrecipes.com/recipe/12345/amazing-cake/"
}
```

**Validation:**
- `url`: Required, valid HTTP/HTTPS URL

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "import_id": 999,
    "status": "completed",
    "recipe": {
      "title": "Amazing Cake",
      "description": "A delicious cake recipe",
      "source_url": "https://www.allrecipes.com/recipe/12345/amazing-cake/",
      "image_url": "https://www.allrecipes.com/images/cake.jpg",
      "prep_time": 20,
      "cook_time": 35,
      "servings": 8,
      "ingredients": [...],
      "instructions": [...],
      "tags": ["dessert", "cake"]
    }
  }
}
```

**Note:** If parsing takes time, may return 202 Accepted with import_id to check status later.

#### POST /imports/image
Import recipe from image (OCR).

**Request:** multipart/form-data
```
Content-Type: multipart/form-data

image: [file]
```

**Validation:**
- File type: image/jpeg, image/png, image/heic
- Max size: 10MB

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "import_id": 1000,
    "status": "processing",
    "message": "Image is being processed. Check status at /imports/1000"
  }
}
```

#### POST /imports/text
Import recipe from plain text.

**Request:**
```json
{
  "text": "Chocolate Chip Cookies\n\nIngredients:\n- 2 cups flour\n- 1 cup butter\n\nInstructions:\n1. Mix ingredients\n2. Bake at 350F"
}
```

**Response:** 200 OK (returns parsed recipe)

#### GET /imports/:id
Get import status and result.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "import": {
      "id": 999,
      "user_id": 123,
      "source_url": "https://example.com/recipe",
      "source_type": "url",
      "status": "completed",
      "recipe_id": 789,
      "created_at": "2025-12-05T15:00:00Z",
      "completed_at": "2025-12-05T15:00:05Z"
    }
  }
}
```

**Status values:** pending, processing, completed, failed

#### GET /imports
List import history.

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status

**Response:** 200 OK (paginated list of imports)

#### DELETE /imports/:id
Delete import record.

**Response:** 204 No Content

---

### 6.5 Collection Endpoints

#### GET /collections
List user's recipe collections.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "collections": [
      {
        "id": 10,
        "name": "Weeknight Dinners",
        "description": "Quick and easy dinner recipes",
        "icon": "dinner",
        "color": "#FF5733",
        "recipe_count": 25,
        "is_public": false,
        "created_at": "2025-11-01T10:00:00Z"
      }
    ]
  }
}
```

#### POST /collections
Create new collection.

**Request:**
```json
{
  "name": "Holiday Recipes",
  "description": "Special recipes for holidays",
  "icon": "celebration",
  "color": "#FFD700",
  "is_public": false
}
```

**Response:** 201 Created

#### GET /collections/:id
Get collection with recipes.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "collection": {
      "id": 10,
      "name": "Weeknight Dinners",
      "description": "Quick and easy dinner recipes",
      "icon": "dinner",
      "color": "#FF5733",
      "is_public": false,
      "recipe_count": 25,
      "recipes": [
        {
          "id": 456,
          "title": "Spaghetti Carbonara",
          "image_url": "/uploads/recipes/456.jpg",
          "prep_time": 10,
          "cook_time": 15,
          "added_at": "2025-11-15T10:00:00Z"
        }
      ]
    }
  }
}
```

#### PUT /collections/:id
Update collection.

**Request:** Same as POST

**Response:** 200 OK

#### DELETE /collections/:id
Delete collection (recipes are not deleted).

**Response:** 204 No Content

#### POST /collections/:id/recipes/:recipeId
Add recipe to collection.

**Response:** 201 Created

#### DELETE /collections/:id/recipes/:recipeId
Remove recipe from collection.

**Response:** 204 No Content

---

### 6.6 Meal Plan Endpoints

#### GET /meal-plans
Get meal plans for date range.

**Query Parameters:**
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)
- `meal_type`: Filter by type (breakfast, lunch, dinner, snack)

**Example:**
```http
GET /api/v1/meal-plans?start_date=2025-12-01&end_date=2025-12-07
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "meal_plans": [
      {
        "id": 50,
        "recipe_id": 456,
        "recipe": {
          "id": 456,
          "title": "Spaghetti Carbonara",
          "image_url": "/uploads/recipes/456.jpg",
          "prep_time": 10,
          "cook_time": 15
        },
        "planned_date": "2025-12-05",
        "meal_type": "dinner",
        "servings": 4,
        "notes": "Double the recipe",
        "completed": false,
        "created_at": "2025-12-01T10:00:00Z"
      }
    ]
  }
}
```

#### POST /meal-plans
Add recipe to meal plan.

**Request:**
```json
{
  "recipe_id": 456,
  "planned_date": "2025-12-05",
  "meal_type": "dinner",
  "servings": 4,
  "notes": "Make extra for leftovers"
}
```

**Response:** 201 Created

#### GET /meal-plans/:id
Get single meal plan entry.

**Response:** 200 OK

#### PUT /meal-plans/:id
Update meal plan entry.

**Request:**
```json
{
  "planned_date": "2025-12-06",
  "meal_type": "lunch",
  "servings": 2,
  "notes": "Updated notes"
}
```

**Response:** 200 OK

#### DELETE /meal-plans/:id
Remove from meal plan.

**Response:** 204 No Content

#### POST /meal-plans/:id/complete
Mark meal as completed.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "completed": true
  }
}
```

#### GET /meal-plans/week
Get current week's meal plan.

**Response:** 200 OK (same format as GET /meal-plans)

---

### 6.7 Shopping List Endpoints

#### GET /shopping-lists
List all shopping lists.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "lists": [
      {
        "id": 15,
        "name": "Weekly Groceries",
        "item_count": 28,
        "checked_count": 12,
        "created_at": "2025-12-01T10:00:00Z",
        "updated_at": "2025-12-05T08:30:00Z"
      }
    ]
  }
}
```

#### POST /shopping-lists
Create new shopping list.

**Request:**
```json
{
  "name": "Weekend Groceries"
}
```

**Response:** 201 Created

#### GET /shopping-lists/:id
Get shopping list with all items.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "list": {
      "id": 15,
      "name": "Weekly Groceries",
      "created_at": "2025-12-01T10:00:00Z",
      "items": [
        {
          "id": 100,
          "recipe_id": 456,
          "ingredient_name": "spaghetti",
          "quantity": 800,
          "unit": "g",
          "category": "pasta",
          "checked": false,
          "notes": ""
        },
        {
          "id": 101,
          "recipe_id": null,
          "ingredient_name": "milk",
          "quantity": 2,
          "unit": "liters",
          "category": "dairy",
          "checked": true,
          "notes": "Get organic"
        }
      ]
    }
  }
}
```

#### PUT /shopping-lists/:id
Update shopping list name.

**Request:**
```json
{
  "name": "Updated List Name"
}
```

**Response:** 200 OK

#### DELETE /shopping-lists/:id
Delete shopping list and all items.

**Response:** 204 No Content

#### POST /shopping-lists/:id/items
Add item to shopping list.

**Request:**
```json
{
  "ingredient_name": "tomatoes",
  "quantity": 6,
  "unit": "pieces",
  "category": "produce",
  "notes": "Ripe"
}
```

**Response:** 201 Created

#### PUT /shopping-lists/:id/items/:itemId
Update shopping list item.

**Request:**
```json
{
  "quantity": 8,
  "notes": "Get extra"
}
```

**Response:** 200 OK

#### DELETE /shopping-lists/:id/items/:itemId
Remove item from list.

**Response:** 204 No Content

#### POST /shopping-lists/:id/items/:itemId/check
Toggle item checked status.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "checked": true
  }
}
```

#### POST /shopping-lists/from-meal-plan
Generate shopping list from meal plan.

**Request:**
```json
{
  "name": "This Week's Groceries",
  "start_date": "2025-12-05",
  "end_date": "2025-12-11"
}
```

**Response:** 201 Created (returns new shopping list with aggregated items)

---

### 6.8 Search Endpoints

#### GET /search
Search recipes.

**Query Parameters:**
- `q`: Search query (required)
- `page`, `limit`: Pagination

**Response:** 200 OK (same format as GET /recipes)

#### GET /search/autocomplete
Get autocomplete suggestions.

**Query Parameters:**
- `q`: Partial search query

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "suggestions": [
      "chocolate chip cookies",
      "chocolate cake",
      "chocolate mousse"
    ]
  }
}
```

#### GET /search/ingredients
Search recipes by ingredients.

**Query Parameters:**
- `ingredients`: Comma-separated ingredient list
- `mode`: `all` (contains all) or `any` (contains any)

**Example:**
```http
GET /api/v1/search/ingredients?ingredients=chicken,rice,broccoli&mode=all
```

**Response:** 200 OK (returns matching recipes)

#### GET /search/tags
Get all available tags.

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "tags": [
      {
        "name": "italian",
        "count": 45
      },
      {
        "name": "quick",
        "count": 78
      }
    ]
  }
}
```

---

### 6.9 Utility Endpoints

#### GET /utils/convert
Convert measurements.

**Query Parameters:**
- `value`: Numeric value
- `from`: Source unit
- `to`: Target unit

**Example:**
```http
GET /api/v1/utils/convert?value=2&from=cups&to=ml
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "original": {
      "value": 2,
      "unit": "cups"
    },
    "converted": {
      "value": 473.18,
      "unit": "ml"
    }
  }
}
```

#### POST /utils/parse-ingredients
Parse ingredient text into structured data.

**Request:**
```json
{
  "text": "2 cups all-purpose flour, sifted"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "parsed": {
      "quantity": 2,
      "unit": "cups",
      "name": "all-purpose flour",
      "notes": "sifted"
    }
  }
}
```

#### GET /health
Health check endpoint (no auth required).

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-12-05T15:30:00Z",
    "uptime": 86400,
    "version": "1.0.0"
  }
}
```

---

## 7. Data Models

### 7.1 User Model
```typescript
interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  email_verified: boolean;
  preferences: {
    theme?: 'light' | 'dark';
    default_servings?: number;
    measurement_system?: 'metric' | 'imperial';
  };
  created_at: string;  // ISO 8601
  updated_at: string;
  last_login?: string;
}
```

### 7.2 Recipe Model
```typescript
interface Recipe {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  source_url?: string;
  source_type?: 'url' | 'manual' | 'image' | 'video';
  image_url?: string;
  prep_time?: number;  // minutes
  cook_time?: number;  // minutes
  total_time?: number; // minutes
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  cuisine?: string;
  diet_type?: string[];
  ingredients: Ingredient[];
  instructions: Instruction[];
  notes?: string;
  nutrition?: Nutrition;
  tags: string[];
  rating?: number;  // 0.0-5.0
  is_public: boolean;
  is_favorite: boolean;
  times_cooked: number;
  created_at: string;
  updated_at: string;
}
```

### 7.3 Ingredient Model
```typescript
interface Ingredient {
  name: string;
  quantity?: number;
  unit?: string;
  notes?: string;
}
```

### 7.4 Instruction Model
```typescript
interface Instruction {
  step_number: number;
  instruction: string;
}
```

### 7.5 Nutrition Model
```typescript
interface Nutrition {
  calories?: number;
  protein?: number;   // grams
  fat?: number;       // grams
  carbs?: number;     // grams
  fiber?: number;     // grams
  sugar?: number;     // grams
  sodium?: number;    // mg
}
```

### 7.6 Collection Model
```typescript
interface Collection {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_public: boolean;
  recipe_count: number;
  created_at: string;
  updated_at: string;
}
```

### 7.7 MealPlan Model
```typescript
interface MealPlan {
  id: number;
  user_id: number;
  recipe_id: number;
  recipe?: Recipe;
  planned_date: string;  // YYYY-MM-DD
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servings?: number;
  notes?: string;
  completed: boolean;
  created_at: string;
}
```

### 7.8 ShoppingList Model
```typescript
interface ShoppingList {
  id: number;
  user_id: number;
  name: string;
  item_count: number;
  checked_count: number;
  created_at: string;
  updated_at: string;
}
```

### 7.9 ShoppingListItem Model
```typescript
interface ShoppingListItem {
  id: number;
  list_id: number;
  recipe_id?: number;
  ingredient_name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  checked: boolean;
  notes?: string;
  created_at: string;
}
```

---

## 8. Webhooks

*Webhooks not implemented in v1.0 - reserved for future use*

---

## 9. API Versioning

### 9.1 Versioning Strategy
- URL-based versioning: `/api/v1/`, `/api/v2/`
- Current version: v1
- Version in base URL path

### 9.2 Version Lifecycle
- Each version supported for minimum 12 months after next version release
- Deprecation notices sent 6 months before sunset
- Breaking changes only in new major versions

### 9.3 Backward Compatibility
- Non-breaking changes (new fields, endpoints) added to current version
- Breaking changes require new version
- Optional fields can be added without version bump

---

## 10. Examples

### 10.1 Complete User Flow: Register to Create Recipe

**1. Register:**
```bash
curl -X POST http://<SERVER_IP>/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "chef@example.com",
    "password": "SecurePass123!",
    "username": "masterchef"
  }'
```

**2. Create Recipe:**
```bash
curl -X POST http://<SERVER_IP>/api/v1/recipes \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Recipe",
    "prep_time": 10,
    "cook_time": 20,
    "servings": 4,
    "ingredients": [
      {"name": "pasta", "quantity": 500, "unit": "g"}
    ],
    "instructions": [
      {"step_number": 1, "instruction": "Boil water"}
    ]
  }'
```

### 10.2 Import Recipe from URL

```bash
curl -X POST http://<SERVER_IP>/api/v1/imports/url \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.allrecipes.com/recipe/12345/cake/"
  }'
```

### 10.3 Create Meal Plan and Shopping List

**Add to meal plan:**
```bash
curl -X POST http://<SERVER_IP>/api/v1/meal-plans \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "recipe_id": 456,
    "planned_date": "2025-12-10",
    "meal_type": "dinner",
    "servings": 4
  }'
```

**Generate shopping list:**
```bash
curl -X POST http://<SERVER_IP>/api/v1/shopping-lists/from-meal-plan \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "This Week",
    "start_date": "2025-12-09",
    "end_date": "2025-12-15"
  }'
```

---

## Appendix A: Quick Reference

### Authentication Endpoints
- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh token

### Recipe Endpoints
- `GET /recipes` - List recipes
- `POST /recipes` - Create recipe
- `GET /recipes/:id` - Get recipe
- `PUT /recipes/:id` - Update recipe
- `DELETE /recipes/:id` - Delete recipe

### Import Endpoints
- `POST /imports/url` - Import from URL
- `POST /imports/image` - Import from image
- `GET /imports/:id` - Get import status

### Collection Endpoints
- `GET /collections` - List collections
- `POST /collections` - Create collection
- `POST /collections/:id/recipes/:recipeId` - Add recipe

### Meal Plan Endpoints
- `GET /meal-plans` - Get meal plans
- `POST /meal-plans` - Add to meal plan

### Shopping List Endpoints
- `GET /shopping-lists` - List shopping lists
- `POST /shopping-lists` - Create list
- `GET /shopping-lists/:id` - Get list with items
- `POST /shopping-lists/from-meal-plan` - Generate from meal plan

---

## Appendix B: Status Codes Quick Reference

| Code | Meaning           | Use Case                   |
|------|-------------------|----------------------------|
| 200  | OK                | Successful GET, PUT, PATCH |
| 201  | Created           | Successful POST            |
| 204  | No Content        | Successful DELETE          |
| 400  | Bad Request       | Invalid input              |
| 401  | Unauthorized      | Auth required/failed       |
| 403  | Forbidden         | Not authorized             |
| 404  | Not Found         | Resource doesn't exist     |
| 422  | Unprocessable     | Validation error           |
| 429  | Too Many Requests | Rate limit                 |
| 500  | Server Error      | Internal error             |

---

**Document Version**: 1.0  
**Last Updated**: December 5, 2025  
**Maintained By**: Development Team
