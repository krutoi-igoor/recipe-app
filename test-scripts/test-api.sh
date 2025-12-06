#!/bin/bash
# Comprehensive API test script

API="http://localhost:3000/api/v1"

echo "=== RECIPE APP API TEST ==="
echo

# 1. Register
echo "1. Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "apitest@example.com",
    "password": "TestPass123!",
    "username": "apitestuser",
    "firstName": "API",
    "lastName": "Test"
  }')

TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token')
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.user.id')

if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
  echo "✓ Registered user ID: $USER_ID"
else
  echo "✗ Registration failed"
  echo "$REGISTER_RESPONSE" | jq .
  exit 1
fi

# 2. Create recipe
echo
echo "2. Creating recipe..."
RECIPE_RESPONSE=$(curl -s -X POST "$API/recipes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Recipe",
    "description": "A test recipe",
    "instructions": ["Step 1", "Step 2"],
    "ingredients": [
      {"name": "Flour", "quantity": "2", "unit": "cups"},
      {"name": "Water", "quantity": "1", "unit": "cup"}
    ]
  }')

RECIPE_ID=$(echo "$RECIPE_RESPONSE" | jq -r '.data.id')
if [ "$RECIPE_ID" != "null" ] && [ "$RECIPE_ID" != "" ]; then
  echo "✓ Recipe created: $RECIPE_ID"
else
  echo "✗ Recipe creation failed"
  echo "$RECIPE_RESPONSE" | jq .
fi

# 3. Get recipes
echo
echo "3. Getting recipes..."
RECIPES_RESPONSE=$(curl -s -X GET "$API/recipes" \
  -H "Authorization: Bearer $TOKEN")

COUNT=$(echo "$RECIPES_RESPONSE" | jq '.data | length')
echo "✓ Found $COUNT recipes"

# 4. Create meal plan
echo
echo "4. Creating meal plan..."
MEALPLAN_RESPONSE=$(curl -s -X POST "$API/meal-plans" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "date": "2025-12-10T00:00:00.000Z",
    "recipeId": '$RECIPE_ID',
    "notes": "Test meal plan"
  }')

MEALPLAN_ID=$(echo "$MEALPLAN_RESPONSE" | jq -r '.data.id')
if [ "$MEALPLAN_ID" != "null" ] && [ "$MEALPLAN_ID" != "" ]; then
  echo "✓ Meal plan created: $MEALPLAN_ID"
else
  echo "✗ Meal plan creation failed"
  echo "$MEALPLAN_RESPONSE" | jq .
fi

# 5. Get meal plans
echo
echo "5. Getting meal plans..."
MEALPLANS_RESPONSE=$(curl -s -X GET "$API/meal-plans" \
  -H "Authorization: Bearer $TOKEN")

COUNT=$(echo "$MEALPLANS_RESPONSE" | jq '.data | length')
echo "✓ Found $COUNT meal plans"

# 6. Get shopping list
echo
echo "6. Getting shopping list..."
SHOPPING_RESPONSE=$(curl -s -X GET "$API/meal-plans/shopping-list?startDate=2025-12-01&endDate=2025-12-31" \
  -H "Authorization: Bearer $TOKEN")

ITEMS=$(echo "$SHOPPING_RESPONSE" | jq '.data | length')
echo "✓ Found $ITEMS shopping list items"

# 7. Create collection
echo
echo "7. Creating collection..."
COLLECTION_RESPONSE=$(curl -s -X POST "$API/collections" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Collection"
  }')

COLLECTION_ID=$(echo "$COLLECTION_RESPONSE" | jq -r '.data.id')
if [ "$COLLECTION_ID" != "null" ] && [ "$COLLECTION_ID" != "" ]; then
  echo "✓ Collection created: $COLLECTION_ID"
else
  echo "✗ Collection creation failed"
  echo "$COLLECTION_RESPONSE" | jq .
fi

# 8. Add recipe to collection
echo
echo "8. Adding recipe to collection..."
ADD_RESPONSE=$(curl -s -X POST "$API/collections/$COLLECTION_ID/recipes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "recipeId": '$RECIPE_ID'
  }')

SUCCESS=$(echo "$ADD_RESPONSE" | jq '.success')
if [ "$SUCCESS" = "true" ]; then
  echo "✓ Recipe added to collection"
else
  echo "✗ Failed to add recipe to collection"
  echo "$ADD_RESPONSE" | jq .
fi

# 9. Get collections
echo
echo "9. Getting collections..."
COLLECTIONS_RESPONSE=$(curl -s -X GET "$API/collections" \
  -H "Authorization: Bearer $TOKEN")

COUNT=$(echo "$COLLECTIONS_RESPONSE" | jq '.data | length')
echo "✓ Found $COUNT collections"

# 10. Delete meal plan
echo
echo "10. Deleting meal plan..."
DELETE_RESPONSE=$(curl -s -X DELETE "$API/meal-plans/$MEALPLAN_ID" \
  -H "Authorization: Bearer $TOKEN")

SUCCESS=$(echo "$DELETE_RESPONSE" | jq '.success')
if [ "$SUCCESS" = "true" ]; then
  echo "✓ Meal plan deleted"
else
  echo "✗ Failed to delete meal plan"
  echo "$DELETE_RESPONSE" | jq .
fi

# 11. Delete collection
echo
echo "11. Deleting collection..."
DELETE_RESPONSE=$(curl -s -X DELETE "$API/collections/$COLLECTION_ID" \
  -H "Authorization: Bearer $TOKEN")

SUCCESS=$(echo "$DELETE_RESPONSE" | jq '.success')
if [ "$SUCCESS" = "true" ]; then
  echo "✓ Collection deleted"
else
  echo "✗ Failed to delete collection"
  echo "$DELETE_RESPONSE" | jq .
fi

# 12. Delete recipe
echo
echo "12. Deleting recipe..."
DELETE_RESPONSE=$(curl -s -X DELETE "$API/recipes/$RECIPE_ID" \
  -H "Authorization: Bearer $TOKEN")

SUCCESS=$(echo "$DELETE_RESPONSE" | jq '.success')
if [ "$SUCCESS" = "true" ]; then
  echo "✓ Recipe deleted"
else
  echo "✗ Failed to delete recipe"
  echo "$DELETE_RESPONSE" | jq .
fi

echo
echo "=== TEST COMPLETE ==="
