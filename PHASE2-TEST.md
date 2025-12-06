# Phase 2 Testing Guide

## Manual Testing Steps

### Prerequisites
1. Start containers: `podman-compose up -d`
2. Wait ~10 seconds for services to initialize
3. Visit `http://localhost:5174`

### Test Flow

#### 1. Authentication
- [ ] Register new user with email, username (alphanumeric 3-30 chars), password (8+ chars)
- [ ] Verify tokens stored in localStorage
- [ ] Login with registered credentials
- [ ] Check "Signed in as" shows email

#### 2. Recipe Management (Phase 1 + 2)
- [ ] Create a recipe with:
  - Title: "Pasta Carbonara"
  - Description: "Classic Italian pasta"
  - Ingredients: Pasta (400g), Eggs (3), Bacon (200g)
  - Instructions: Cook pasta / Fry bacon / Mix eggs / Combine all
- [ ] Verify recipe appears in list with formatted ingredients/instructions
- [ ] Click "Edit" button on recipe
- [ ] Modify recipe (e.g., change title to "Carbonara Pasta")
- [ ] Click "Delete" button, confirm deletion
- [ ] Create another recipe for testing meal plans

#### 3. Meal Planning (NEW - Phase 2)
- [ ] Click a date on the calendar
- [ ] Select a recipe from dropdown
- [ ] Add optional notes
- [ ] Click "Save meal plan"
- [ ] Verify date shows recipe title in green
- [ ] Navigate months using Previous/Next/Today buttons
- [ ] Click another date, select different recipe
- [ ] Verify both meal plans persist

#### 4. Shopping List (NEW - Phase 2)
- [ ] Set date range (e.g., this week)
- [ ] Click "Generate"
- [ ] Verify shopping list shows aggregated ingredients:
  - If 2 recipes both use Pasta (400g), should show Pasta (800g)
  - Ingredients grouped by name and unit
- [ ] Click "Download CSV" and verify file downloads
- [ ] Click "Download JSON" and verify file downloads
- [ ] Check JSON content has `[{ name, quantity, unit }]` format
- [ ] Check CSV has headers: Item, Quantity, Unit

#### 5. Collections (NEW - Phase 2)
- [ ] Click "+ New Collection"
- [ ] Create collection: "Weeknight Meals"
- [ ] Click collection to select it
- [ ] Click "+ Add Recipe"
- [ ] Select a recipe from dropdown
- [ ] Verify recipe appears in collection
- [ ] Create second collection: "Dinner Party"
- [ ] Switch to first collection
- [ ] Add second recipe to first collection
- [ ] Verify both recipes in "Weeknight Meals"
- [ ] Click "Remove" on one recipe
- [ ] Verify removed recipe no longer in collection
- [ ] Click "Delete Collection"
- [ ] Verify collection removed from list

#### 6. API Endpoints (Direct Testing)
Using curl or Postman:

```bash
# Login (get token)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create meal plan (replace TOKEN and RECIPE_ID)
curl -X POST http://localhost:3000/api/v1/meal-plans \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-01-15T00:00:00Z","recipeId":1,"notes":"Family dinner"}'

# Get meal plans for date range
curl -X GET "http://localhost:3000/api/v1/meal-plans?startDate=2025-01-01T00:00:00Z&endDate=2025-01-31T23:59:59Z" \
  -H "Authorization: Bearer TOKEN"

# Get shopping list
curl -X GET "http://localhost:3000/api/v1/meal-plans/shopping-list?startDate=2025-01-01T00:00:00Z&endDate=2025-01-31T23:59:59Z" \
  -H "Authorization: Bearer TOKEN"

# Create collection
curl -X POST http://localhost:3000/api/v1/collections \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Desserts"}'

# Get collections
curl -X GET http://localhost:3000/api/v1/collections \
  -H "Authorization: Bearer TOKEN"

# Add recipe to collection (replace COLLECTION_ID and RECIPE_ID)
curl -X POST http://localhost:3000/api/v1/collections/COLLECTION_ID/recipes \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipeId":RECIPE_ID}'

# Remove recipe from collection
curl -X DELETE http://localhost:3000/api/v1/collections/COLLECTION_ID/recipes/RECIPE_ID \
  -H "Authorization: Bearer TOKEN"
```

### Expected Results

#### Meal Planning
- Calendar displays current month with clickable dates
- Dates with meal plans show recipe title in green box
- Meal plan form validates date required
- Multiple meal plans can exist for same date range
- Deleting meal plan removes it from calendar

#### Shopping List
- Ingredients from all selected meal plans are summed by name + unit
- Export formats are valid CSV and JSON
- Date range filtering works correctly

#### Collections
- Each user sees only their own collections
- Recipe can be in multiple collections
- Deleting collection cascades to remove all associations
- Collection list updates after CRUD operations

### Potential Issues to Check

1. **CORS**: Frontend can reach backend at `http://localhost:3000/api/v1`
2. **Tokens**: Refresh tokens work if session expires
3. **Database**: Prisma migrations applied (`MealPlan`, `Collection` tables exist)
4. **Routes**: All new endpoints registered in `app.js`
5. **Validation**: Joi schemas validate required fields

### Known Limitations (Future Enhancements)

- [ ] Image uploads not yet implemented
- [ ] Export endpoints (standalone JSON/CSV endpoints) not yet implemented
- [ ] User profile/settings UI not yet implemented
- [ ] Toast notifications not yet implemented
- [ ] No search/filter on recipes or collections
