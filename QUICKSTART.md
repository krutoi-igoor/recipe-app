# Phase 2 Quick Reference

## 🎯 What's Ready to Test

### Feature Checklist
- ✅ **Recipe Edit** - Click "Edit" button on recipe card
- ✅ **Recipe Delete** - Click "Delete" button, confirm deletion
- ✅ **Meal Planning** - Click calendar dates to assign recipes
- ✅ **Shopping List** - Generate aggregated ingredients with date range
- ✅ **Collections** - Create groups of recipes, add/remove recipes

### Test Accounts
You can use any email/password combo (8+ chars, alphanumeric username 3-30 chars)
```
Email: test@example.com
Password: password123
Username: testuser123
```

## 🚀 How to Start

```bash
# 1. Open project
cd c:\Users\alex_\Desktop\recipe-app

# 2. Start containers
podman-compose up -d

# 3. Open browser
http://localhost:5174
```

## 📋 Test Scenarios (5-10 min each)

### Meal Planning (5 min)
1. Create 2 recipes first (titles: "Pasta", "Salad")
2. Click January 15 on calendar
3. Select "Pasta" recipe
4. Add notes "Family dinner"
5. Save meal plan
6. Verify "Pasta" appears in green box on Jan 15
7. Click Jan 20, select "Salad"
8. Verify both dates show recipes

### Shopping List (5 min)
1. Set date range: Jan 1-31
2. Click Generate
3. Should see ingredients from both recipes (summed if duplicates)
4. Click "Download CSV" → verify file
5. Click "Download JSON" → verify file

### Collections (5 min)
1. Create collection "Dinners"
2. Click collection to select it
3. Click "+ Add Recipe"
4. Add "Pasta" to collection
5. Add "Salad" to collection
6. Both should appear in collection
7. Remove "Salad"
8. Verify only "Pasta" remains

## 🔧 What's New

### Backend
- **3 new tables**: MealPlan, Collection, CollectionRecipe
- **10+ new endpoints**: CRUD operations + shopping list aggregation
- **1 migration file**: Ready to apply to database

### Frontend
- **~350 lines added** to React component
- **20 new API methods** for meal plans and collections
- **4 new sections**: Edit modal, Calendar, Shopping list, Collections UI

### Documentation
- **PHASE2-TEST.md** - Step-by-step testing with curl examples
- **PHASE2-SUMMARY.md** - Technical implementation details
- **PHASE2-VISUAL-GUIDE.md** - Data flow diagrams
- **PHASE2-STATUS.md** - Status report (this document)

## 📚 File Locations

| File | Purpose | Type |
|------|---------|------|
| `backend/src/controllers/mealPlanController.js` | Meal plan logic | Code |
| `backend/src/controllers/collectionController.js` | Collection logic | Code |
| `backend/src/routes/mealPlans.js` | Meal plan routes | Code |
| `backend/src/routes/collections.js` | Collection routes | Code |
| `backend/prisma/migrations/20250107_add_meal_plans_collections/migration.sql` | DB schema | SQL |
| `frontend/src/App.jsx` | UI components | React |
| `PHASE2-TEST.md` | Testing guide | Docs |
| `PHASE2-SUMMARY.md` | Tech details | Docs |

## ⚡ Quick API Tests (with curl)

```bash
# Get your token first (login)
TOKEN="your_bearer_token_here"

# Create meal plan
curl -X POST http://localhost:3000/api/v1/meal-plans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date":"2025-01-20T00:00:00Z",
    "recipeId":1,
    "notes":"Dinner with friends"
  }'

# Get shopping list
curl -X GET "http://localhost:3000/api/v1/meal-plans/shopping-list?startDate=2025-01-01T00:00:00Z&endDate=2025-01-31T23:59:59Z" \
  -H "Authorization: Bearer $TOKEN"

# Create collection
curl -X POST http://localhost:3000/api/v1/collections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Weeknight Meals"}'
```

## ✅ Quality Checks

- ✅ No syntax errors (React + Node)
- ✅ All validation schemas defined
- ✅ Database migration ready
- ✅ Authorization checks implemented
- ✅ Error handling in place
- ✅ API documented
- ✅ Test paths documented

## 🎓 Learning Resources

If you want to understand the implementation:

1. **Database Schema** → `PHASE2-VISUAL-GUIDE.md` (Data Flow section)
2. **API Endpoints** → `DEVELOPER-SETUP.md` (API Reference section)
3. **Frontend Flow** → `PHASE2-SUMMARY.md` (Frontend Integration section)
4. **Testing** → `PHASE2-TEST.md` (Manual Testing Steps)

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| Containers won't start | Check ports: 5432 (DB), 6379 (Redis), 3000 (Backend), 5174 (Frontend) |
| Can't see recipes in meal plan dropdown | Make sure you created recipes first |
| Shopping list shows no items | Verify you created meal plans for selected date range |
| Collection not saving | Check browser console for errors, ensure authenticated |
| CSV download empty | Date range might not have any meal plans |

## 📞 Next Steps

1. **Run the app** → `podman-compose up -d`
2. **Test features** → Follow PHASE2-TEST.md
3. **Review code** → Check backend/src/controllers/ for logic
4. **Explore API** → Try curl examples above
5. **Plan Phase 3** → Image uploads, user profile, toast notifications

## 📊 Git Commits This Session

```
7149231 - docs: add Phase 2 status report
af15c96 - docs: add Phase 2 visual workflow guide
1cc2e4f - docs: add Phase 2 implementation summary
7e380c5 - docs: add Phase 2 comprehensive testing guide
1619008 - docs: add Phase 2 API endpoints
fe7bf76 - feat: Phase 2 - recipe edit/delete, meal planning, shopping list, collections
```

---

**Status:** ✅ Ready for testing  
**Estimated test time:** 30-45 minutes  
**Estimated Phase 3 start:** After successful Phase 2 testing
