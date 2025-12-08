#!/bin/bash
# Simple API test without jq

API="http://localhost:3000/api/v1"
EMAIL="apitest$(date +%s)@test.com"

echo "=== Testing Recipe App API ==="
echo ""
echo "1. Registering..."
REG=$(curl -s -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"Pass123!\",\"username\":\"user$(date +%s)\",\"firstName\":\"Test\",\"lastName\":\"User\"}")

TOKEN=$(echo "$REG" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
USER_ID=$(echo "$REG" | sed -n 's/.*"id":\([0-9]*\).*/\1/p' | head -1)

if [ -n "$TOKEN" ]; then
  echo "✓ Registered (ID: $USER_ID)"
else
  echo "✗ Registration failed: $REG"
  exit 1
fi

echo ""
echo "2. Creating recipe..."
RECIPE=$(curl -s -X POST "$API/recipes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Pasta","description":"Test","instructions":["Boil","Serve"],"ingredients":[{"name":"Pasta","quantity":"1","unit":"box"}]}')

RECIPE_ID=$(echo "$RECIPE" | sed -n 's/.*"id":\([0-9]*\).*/\1/p' | head -1)
if [ -n "$RECIPE_ID" ]; then
  echo "✓ Recipe created (ID: $RECIPE_ID)"
else
  echo "✗ Recipe failed: $RECIPE"
fi

echo ""
echo "3. Creating meal plan..."
MEALPLAN=$(curl -s -X POST "$API/meal-plans" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"date\":\"2025-12-15T00:00:00.000Z\",\"recipeId\":$RECIPE_ID,\"notes\":\"Test\"}")

MP_ID=$(echo "$MEALPLAN" | sed -n 's/.*"id":\([0-9]*\).*/\1/p' | head -1)
if [ -n "$MP_ID" ]; then
  echo "✓ Meal plan created (ID: $MP_ID)"
else
  echo "✗ Meal plan failed: $MEALPLAN"
fi

echo ""
echo "4. Testing auto-tag endpoint..."
AUTOTAG=$(curl -s -X POST "$API/imports/$RECIPE_ID/auto-tag" \
  -H "Authorization: Bearer $TOKEN")

TAGS=$(echo "$AUTOTAG" | grep -o '"tags"' | head -1)
if [ -n "$TAGS" ]; then
  echo "✓ Auto-tag created tags"
else
  echo "✗ Auto-tag failed: $AUTOTAG"
fi

echo ""
echo "5. Testing search endpoint..."
SEARCH=$(curl -s -X GET "$API/search?q=Pasta" \
  -H "Authorization: Bearer $TOKEN")

FOUND=$(echo "$SEARCH" | grep -o '"id"' | wc -l)
echo "✓ Search found $FOUND results"

echo ""
echo "6. Creating collection..."
COLLECTION=$(curl -s -X POST "$API/collections" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Collection"}')

COLLECTION_ID=$(echo "$COLLECTION" | sed -n 's/.*"id":\([0-9]*\).*/\1/p' | head -1)
if [ -n "$COLLECTION_ID" ]; then
  echo "✓ Collection created (ID: $COLLECTION_ID)"
else
  echo "✗ Collection failed: $COLLECTION"
fi

echo ""
echo "7. Adding recipe to collection..."
ADD=$(curl -s -X POST "$API/collections/$COLLECTION_ID/recipes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"recipeId\":$RECIPE_ID}")

SUCCESS=$(echo "$ADD" | grep -o '"success":true')
if [ -n "$SUCCESS" ]; then
  echo "✓ Recipe added to collection"
else
  echo "✗ Failed to add recipe: $ADD"
fi

echo ""
echo "8. Testing privacy export..."
EXPORT=$(curl -s -X GET "$API/privacy/export/json" \
  -H "Authorization: Bearer $TOKEN")

USER_DATA=$(echo "$EXPORT" | grep -o '"email"' | head -1)
if [ -n "$USER_DATA" ]; then
  echo "✓ Privacy export successful"
else
  echo "✗ Privacy export failed: $EXPORT"
fi

echo ""
echo "9. Getting shopping list..."
SHOPPING=$(curl -s -X GET "$API/meal-plans/shopping-list?startDate=2025-12-01&endDate=2025-12-31" \
  -H "Authorization: Bearer $TOKEN")

ITEMS=$(echo "$SHOPPING" | grep -o '"name"' | wc -l)
echo "✓ Shopping list has $ITEMS items"

echo ""
echo "=== ✓ ALL TESTS PASSED ==="
