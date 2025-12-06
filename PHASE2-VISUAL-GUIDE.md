# Phase 2 - Visual Workflow

## Recipe Management Enhanced
```
Recipe Card (from Phase 1)
├── Title, Description, Ingredients, Instructions
├── [Edit] ← NEW - Opens modal with editable form
└── [Delete] ← NEW - Removes recipe with confirmation
```

## Meal Planning Workflow (NEW)
```
Calendar View
├── Month Navigation [Prev] [Today] [Next]
├── Month Grid (7 cols × 6 rows)
│   └── Each date cell
│       ├── Date number (1-31)
│       ├── [Optional] Recipe title (green box)
│       ├── Click to open form
│       └── [Remove] button for existing meal plan
│
└── Meal Plan Form (when date clicked)
    ├── Date input (pre-filled)
    ├── Recipe dropdown (optional)
    ├── Notes textarea (optional)
    └── [Save] [Cancel] buttons
```

## Shopping List Workflow (NEW)
```
Shopping List Generator
├── Date Range Inputs
│   ├── From: [YYYY-MM-DD]
│   ├── To: [YYYY-MM-DD]
│   └── [Generate] button
│
├── Aggregated Results (if ingredients found)
│   ├── Table
│   │   └── Item | Quantity | Unit
│   │       ├── Pasta | 800 | g (summed from 2 recipes)
│   │       ├── Eggs | 6 | pcs (summed from 2 recipes)
│   │       └── ...
│   │
│   └── Export Options
│       ├── [↓ Download CSV] → shopping-list-2025-01-15.csv
│       └── [↓ Download JSON] → shopping-list-2025-01-15.json
│
└── No Results State
    └── "No shopping list generated..."
```

## Collections Workflow (NEW)
```
Collections Management (Two Panel View)

LEFT PANEL: Collection List
├── [+ New Collection]
│   └── Modal: Name input → [Create] [Cancel]
│
└── Collections (Clickable List)
    ├── 🔵 Weeknight Meals (3 recipes) ← Selected (highlighted)
    ├── ○ Dinner Party (5 recipes)
    ├── ○ Desserts (2 recipes)
    └── ...

RIGHT PANEL: Collection Details (shows when selected)
├── Title: "Weeknight Meals"
├── [+ Add Recipe] button
│   └── Modal: Recipe dropdown → [Add] [Cancel]
│
├── Recipes in Collection
│   ├── Pasta Carbonara
│   │   └── [Remove] button
│   ├── Stir Fry
│   │   └── [Remove] button
│   └── ...
│
└── [Delete Collection] button (red, with confirmation)
```

## Data Flow

### Backend Architecture
```
Request → authMiddleware (validates token)
  └→ Route Handler
      ├─ Request Validation (Joi schemas)
      ├─ Prisma Query
      └─ Response JSON

Example: GET /api/v1/meal-plans/shopping-list?startDate=...&endDate=...
  └→ getMealPlans(userId, startDate, endDate)
      └→ Parse ingredients from recipes
          └→ Group by (name, unit)
              └→ Sum quantities
                  └→ Return array of aggregated items
```

### Frontend State Flow
```
Component Mounts
  └→ checkHealth()
  └→ getTokens() → if exists: fetchMe()
      └→ loadRecipes()
      └→ loadMealPlans() [if authenticated]
      └→ loadCollections() [if authenticated]

User Action: Click date on calendar
  └→ setMealPlanForm({ date: clicked_date, ... })
  └→ setShowMealPlanForm(true)
  
User Action: Submit meal plan form
  └→ api.mealPlans.create(data)
      └→ loadMealPlans() [refresh calendar]
      
User Action: Generate shopping list
  └→ api.mealPlans.shoppingList({ startDate, endDate })
      └→ setShoppingList(response)
```

## Database Relations

```
User (1)
  ├── (1:N) → Recipe
  │   └── (1:N) → MealPlan
  │       └── (N:1) → User
  │
  ├── (1:N) → Collection
  │   └── (1:N) → CollectionRecipe
  │       └── (N:1) → Recipe
  │
  └── (1:N) → MealPlan
      └── (N:1) → Recipe (nullable)
```

## API Call Examples

### Meal Planning
```bash
# Create meal plan for January 20, 2025
POST /api/v1/meal-plans
{
  "date": "2025-01-20T00:00:00Z",
  "recipeId": 3,
  "notes": "Family dinner with friends"
}

# Get shopping list for entire January
GET /api/v1/meal-plans/shopping-list?startDate=2025-01-01T00:00:00Z&endDate=2025-01-31T23:59:59Z
Response: [
  { "name": "Pasta", "quantity": 800, "unit": "g" },
  { "name": "Eggs", "quantity": 12, "unit": "pcs" },
  ...
]
```

### Collections
```bash
# Create collection
POST /api/v1/collections
{ "name": "Dinner Party" }

# Add recipe to collection (recipeId=5 to collectionId=2)
POST /api/v1/collections/2/recipes
{ "recipeId": 5 }

# Remove recipe from collection
DELETE /api/v1/collections/2/recipes/5

# Get all collections with recipes
GET /api/v1/collections
Response: [
  {
    "id": 1,
    "name": "Weeknight Meals",
    "recipes": [
      { "recipe": { "id": 3, "title": "Pasta", ... } },
      { "recipe": { "id": 5, "title": "Stir Fry", ... } }
    ]
  },
  ...
]
```

## File Stats

### Code Added
- Backend: ~300 lines (controllers + routes)
- Frontend: ~300 lines (UI components + API calls)
- Migrations: ~35 lines (SQL DDL)
- Validation: ~10 lines (Joi schemas)

### Documentation Added
- PHASE2-SUMMARY.md: ~280 lines
- PHASE2-TEST.md: ~145 lines
- DEVELOPER-SETUP.md: +33 lines (API section)

## Testing Checklist

- [ ] Calendar displays current month
- [ ] Clicking date opens meal plan form
- [ ] Meal plan saves and shows on calendar
- [ ] Navigating months shows correct meal plans
- [ ] Shopping list sums ingredients correctly
- [ ] CSV download creates valid file
- [ ] JSON download creates valid file
- [ ] Creating collection works
- [ ] Adding recipe to collection works
- [ ] Removing recipe from collection works
- [ ] Deleting collection removes all associations
- [ ] User can only see their own data
- [ ] Token refresh works if session expires
- [ ] All form validations work (required fields, etc.)
