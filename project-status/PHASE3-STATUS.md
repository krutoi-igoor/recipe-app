# Phase 3 Implementation - Hero Features & Advanced Features

**Status:** 🚀 IN PROGRESS  
**Date Started:** December 6, 2025  
**Focus:** Social/video import, web/blog import, auto-tagging, advanced search, data privacy

---

## Phase 3 Overview

Phase 3 adds the **hero feature** (social media/video recipe extraction) plus supporting features:

1. **Import Features**
   - Web/blog URL import (recipe extraction)
   - Social media import (TikTok, Instagram, YouTube, Shorts)
   - Image/OCR import (photos, handwritten cards)

2. **Intelligence**
   - Auto-tagging (AI cuisine/meal type/dietary flags)
   - Advanced search with filters (keyword, tags, meal type, cuisine, prep time)

3. **Privacy & Data Ownership**
   - Export library as JSON (full GDPR data portability)
   - Export recipes as CSV
   - Delete all user data (GDPR right to erasure)
   - Data summary for transparency

---

## Architecture

### New API Endpoints

#### Imports (`/api/v1/imports`)
```
POST /api/v1/imports/url
  - Import recipe from web URL (blog, standard sites)
  - Body: { url, title?, description? }
  
POST /api/v1/imports/social
  - Import recipe from social media video
  - Body: { url, platform: 'tiktok'|'instagram'|'youtube'|'shorts' }
  
POST /api/v1/imports/image
  - Import recipe from image (photo, screenshot, handwritten)
  - Body: FormData with 'image' file
  
POST /api/v1/imports/:recipeId/auto-tag
  - AI auto-tagging for cuisine, meal type, dietary flags
```

#### Search (`/api/v1/search`)
```
GET /api/v1/search
  - Advanced recipe search with filters
  - Query params: q, tags, mealType, dietary, cuisine, maxPrepTime, maxCookTime, limit, offset
  
GET /api/v1/search/filters
  - Get available filter options (tags, meal types, cuisines)
```

#### Privacy (`/api/v1/privacy`)
```
GET /api/v1/privacy/data-summary
  - Summary of user's data (GDPR transparency)
  
GET /api/v1/privacy/export/json
  - Export entire library as JSON
  
GET /api/v1/privacy/export/csv
  - Export recipes as CSV
  
DELETE /api/v1/privacy/delete-all
  - Permanently delete all user data (requires password confirmation)
```

### New Controllers
- `importController.js` – handles URL, social, image imports + auto-tagging
- `searchController.js` – advanced search and filtering
- `privacyController.js` – exports and data deletion

### New Routes
- `routes/imports.js`
- `routes/search.js`
- `routes/privacy.js`

### Validation Schemas
- `urlImport` – validates URL and optional title/description
- `socialImport` – validates URL and platform

---

## Implementation Status

### ✅ Completed
- [x] API endpoints scaffolded (all routes created)
- [x] Validation schemas added
- [x] Controllers with placeholder implementations
- [x] Search filtering logic (keyword + tags + time-based)
- [x] Data export (JSON + CSV)
- [x] GDPR compliance (data export, deletion)
- [x] Advanced search filters ready

### 🚀 Next (Implementation Order)

#### Step 1: Web URL Import (Easiest)
- Use `cheerio` or `jsdom` to parse HTML
- Extract: title, description, ingredients, instructions, image
- Provide preview for user edit before saving

**Packages needed:**
```bash
npm install cheerio axios
```

#### Step 2: Social Media Import (Medium)
- Use `youtube-transcript-api` for YouTube captions
- Use `yt-dlp` or API for TikTok/Instagram metadata
- Extract transcripts and parse for ingredients/steps
- Time-code instructions when available

**Packages needed:**
```bash
npm install youtube-transcript-api yt-dlp-node
```

#### Step 3: Image/OCR Import (Medium)
- Use `tesseract.js` (or cloud OCR API like GCP Vision)
- Extract text from images
- Parse ingredients/instructions from extracted text
- Allow user to correct OCR mistakes

**Packages needed:**
```bash
npm install tesseract.js sharp
```

#### Step 4: Auto-Tagging (Medium)
- Use OpenAI GPT API to extract: cuisine, meal type, dietary flags
- Send recipe title + description + ingredients to GPT
- Parse response and add tags

**Packages needed:**
```bash
npm install openai
```

#### Step 5: Advanced Search UI (Hard - Frontend)
- Create search component with filters
- Multi-select tags, cuisine, meal type, dietary
- Time range sliders (prep time, cook time)
- Real-time search as user types
- Display results with applied filters

---

## Testing

### Manual Testing Flow
1. **Web Import:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/imports/url \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://www.allrecipes.com/recipe/12345/pasta-carbonara/",
       "title": "Pasta Carbonara"
     }'
   ```

2. **Social Import:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/imports/social \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
       "platform": "youtube"
     }'
   ```

3. **Search:**
   ```bash
   curl "http://localhost:3000/api/v1/search?q=pasta&tags=italian&mealType=lunch" \
     -H "Authorization: Bearer TOKEN"
   ```

4. **Privacy:**
   ```bash
   # Export JSON
   curl http://localhost:3000/api/v1/privacy/export/json \
     -H "Authorization: Bearer TOKEN" > library.json
   
   # Get data summary
   curl http://localhost:3000/api/v1/privacy/data-summary \
     -H "Authorization: Bearer TOKEN"
   ```

---

## Dependencies to Add

**For web scraping:**
```bash
npm install cheerio axios jsdom
```

**For YouTube/social transcripts:**
```bash
npm install youtube-transcript-api
```

**For OCR:**
```bash
npm install tesseract.js sharp
```

**For AI tagging:**
```bash
npm install openai
```

**For CSV export:**
```bash
npm install json2csv
```

All these are optional – functionality gracefully degrades if packages not installed.

---

## Next Steps

1. Pick the easiest feature first: **Web URL import**
2. Install required packages
3. Implement full flow (fetch → parse → preview → save)
4. Test with real URLs
5. Move to next feature in order
6. Build frontend UI for each feature as it's completed
7. Integrate into main App flow

This modular approach means you can deploy features incrementally without waiting for everything.
