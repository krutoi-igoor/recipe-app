# AI Recipe App Research (Inspiration)

This document captures research on a leading AI-powered recipe keeper app without naming the product. The goal is to inform our build with best practices while avoiding brand references.

---

## Overview
- Mobile-first recipe organizer with AI-powered capture from web links, social video, images, and handwritten cards.
- Tagline concept: "Never lose a recipe from any source."
- Platform: iOS, Android, and web utilities.

---

## Core Capabilities

### 1) AI-Powered Capture
- Web URLs: extract title, ingredients, steps, timing, photos from blogs or sites.
- Social video links (TikTok/Instagram/YouTube/Shorts): pull audio/transcript and reconstruct step-by-step recipes.
- Images/screenshots: OCR to convert handwritten cards or cookbook pages into structured recipes.
- Screenshots cleanup: parse messy screenshots into clean ingredients + instructions.
- Manual entry: quick form for original recipes.

### 2) Smart Organization
- Automated tagging by cuisine, meal type, dietary flags, and key ingredients.
- Custom categories/collections and favorites.
- Fast search (full text + tag filters).
- Clean recipe library with thumbnails.

### 3) Meal Planning
- Drag-and-drop recipes onto a calendar.
- Weekly planning views; connect recipes to dates/meals.
- Bridge between recipe library and schedule.

### 4) Shopping Lists
- Auto-generate lists from meal plans or selected recipes.
- Checkboxes for in-store use; quantities aggregated.

### 5) Cross-Device Sync
- Automatic sync across phone, tablet, and desktop; no manual steps.

---

## Design & UX Notes
- Minimal, modern UI; optimized for one-handed mobile use.
- Recipe detail layout: hero image, metadata, ingredients, instructions, tags, and notes.
- Quick-add ("+") entry; strong camera/scanner affordances.
- Calendar and list views are simple and tactile (drag/drop on planner).

---

## Business Model (Observed)
- Freemium: core saving/organization free.
- Subscription unlocks unlimited saves, advanced planning, and full AI features.
- Cancelling keeps data accessible; premium features lock but recipes stay.

---

## Target Users
- Social-first cooks grabbing recipes from TikTok/IG/YouTube.
- Busy home cooks/parents needing fast meal plans and grocery lists.
- Explorers collecting recipes from many sources.
- Family archivists digitizing handwritten cards.

---

## Competitive Differentiators (Observed)
- Strongest at social/video imports and OCR for handwritten inputs.
- AI-driven auto-tagging and formatting reduce manual cleanup.
- Built for modern discovery (beyond traditional blogs).

---

## Example Workflows

### Social Video to Recipe
1) Paste a TikTok/IG/YouTube link.
2) System fetches transcript/captions, key frames, and description/comments.
3) AI derives ingredients, steps, times, and yields a structured recipe.
4) User reviews, edits, and saves with tags.

### Handwritten Card to Digital
1) Snap a photo of a recipe card.
2) OCR converts handwriting to text.
3) User quickly reviews, fixes any errors, and saves.

### Weekly Meal Planning
1) Browse recipe library and pick meals for the week.
2) Add to calendar by date/meal type.
3) Generate shopping list; quantities aggregated.
4) Check items off while shopping.

---

## Data & Privacy Signals
- Explicit stance that recipes belong to users; no selling/sharing personal data.
- Export options (JSON/XML) to avoid lock-in.

---

## Technical Notes (Observed)
- Imports supported: URLs, image/OCR, social/video links; common recipe formats (.paprikarecipes, .fdx/.fdxz, JSON/XML).
- Platforms: iOS/Android clients; web utilities for conversions and quick imports.

---

## Market Positioning (Generalized)
- Premium AI-powered recipe keeper focused on modern discovery channels.
- Differentiator: excels at social video, screenshots, and handwritten sources where traditional recipe apps struggle.

---

## Key Benefits Summary
- Save from any source (web, video, social, handwritten, screenshots).
- AI automation for formatting and tagging.
- Meal planning and smart shopping lists.
- Cross-device sync and data export/ownership.
- Modern, clean experience with minimal friction.

---

## Takeaways for Our Build
- Prioritize social/video URL ingestion with high accuracy.
- Keep review/edit loop fast after AI extraction.
- Make tagging and search immediate; reduce user cleanup.
- Ensure exports and data ownership are first-class.
- Optimize mobile UX for in-kitchen use.
