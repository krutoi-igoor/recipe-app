# Recipe App - Design System & UI Specifications

## Document Information
**Version**: 1.0  
**Last Updated**: December 5, 2025  
**Design Philosophy**: Clean, modern, user-friendly interface inspired by RecipeOne  
**Target Devices**: Desktop, Tablet, Mobile (responsive)

---

## Table of Contents
1. [Design Principles](#1-design-principles)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Components](#5-components)
6. [Page Layouts](#6-page-layouts)
7. [User Flows](#7-user-flows)
8. [Wireframes](#8-wireframes)
9. [Responsive Design](#9-responsive-design)
10. [Accessibility](#10-accessibility)

---

## 1. Design Principles

### 1.1 Core Principles

**Simplicity**
- Clean, uncluttered interface
- Focus on content (recipes) over chrome
- Intuitive navigation
- Progressive disclosure of complexity

**Efficiency**
- Fast loading times
- Minimal clicks to complete tasks
- Smart defaults
- Keyboard shortcuts

**Delight**
- Smooth animations and transitions
- Thoughtful micro-interactions
- Beautiful food photography
- Friendly error messages

**Accessibility**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast options

### 1.2 Design Inspiration

**Primary Inspiration**: RecipeOne app
- Modern, clean aesthetic
- Card-based recipe display
- Intuitive organization
- Mobile-first approach

**Secondary Influences**:
- Notion (organization and flexibility)
- Pinterest (visual discovery)
- Paprika (detailed recipe view)

---

## 2. Color System

### 2.1 Primary Colors

```css
/* Brand Colors */
--primary-500: #FF6B35;      /* Main brand color - Vibrant Orange */
--primary-400: #FF8456;
--primary-600: #E65F2F;

/* Accent */
--accent-500: #4ECDC4;       /* Teal - for success states */
--accent-400: #6FD9D1;
--accent-600: #45B8B0;

/* Secondary */
--secondary-500: #FFD23F;    /* Yellow - for highlights */
--secondary-400: #FFD964;
--secondary-600: #E6BD38;
```

### 2.2 Neutral Colors

```css
/* Light Mode */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;

/* Dark Mode */
--dark-bg: #1A1A1A;
--dark-surface: #2D2D2D;
--dark-border: #404040;
--dark-text: #E5E5E5;
```

### 2.3 Semantic Colors

```css
/* Success */
--success-light: #D1FAE5;
--success-main: #10B981;
--success-dark: #059669;

/* Warning */
--warning-light: #FEF3C7;
--warning-main: #F59E0B;
--warning-dark: #D97706;

/* Error */
--error-light: #FEE2E2;
--error-main: #EF4444;
--error-dark: #DC2626;

/* Info */
--info-light: #DBEAFE;
--info-main: #3B82F6;
--info-dark: #2563EB;
```

### 2.4 Color Usage

| Element        | Light Mode     | Dark Mode      |
|----------------|----------------|----------------|
| Background     | `#FFFFFF`      | `#1A1A1A`      |
| Surface        | `gray-50`      | `#2D2D2D`      |
| Primary Text   | `gray-900`     | `#E5E5E5`      |
| Secondary Text | `gray-600`     | `gray-400`     |
| Border         | `gray-200`     | `#404040`      |
| Primary Button | `primary-500`  | `primary-500`  |
| Links          | `primary-600`  | `primary-400`  |---

## 3. Typography

### 3.1 Font Families

```css
/* Primary Font - Sans Serif */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                'Helvetica Neue', Arial, sans-serif;

/* Secondary Font - For headings (optional) */
--font-heading: 'Poppins', var(--font-primary);

/* Monospace - For code/measurements */
--font-mono: 'JetBrains Mono', 'Courier New', monospace;
```

### 3.2 Type Scale

```css
/* Headings */
--text-4xl: 3rem;      /* 48px - Page titles */
--text-3xl: 2.25rem;   /* 36px - Section titles */
--text-2xl: 1.875rem;  /* 30px - Card titles */
--text-xl: 1.5rem;     /* 24px - Subsection titles */
--text-lg: 1.25rem;    /* 20px - Large body */

/* Body */
--text-base: 1rem;     /* 16px - Default */
--text-sm: 0.875rem;   /* 14px - Small text */
--text-xs: 0.75rem;    /* 12px - Captions */
```

### 3.3 Font Weights

```css
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 3.4 Line Heights

```css
--leading-tight: 1.25;    /* Headings */
--leading-normal: 1.5;    /* Body text */
--leading-relaxed: 1.75;  /* Long-form content */
```

### 3.5 Typography Examples

```css
/* Page Title */
h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--gray-900);
}

/* Recipe Title */
h2 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
}

/* Body Text */
p {
  font-size: var(--text-base);
  font-weight: var(--font-regular);
  line-height: var(--leading-normal);
  color: var(--gray-700);
}

/* Small Text / Metadata */
.text-meta {
  font-size: var(--text-sm);
  color: var(--gray-600);
}
```

---

## 4. Spacing & Layout

### 4.1 Spacing Scale

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### 4.2 Container Widths

```css
--container-xs: 320px;   /* Mobile */
--container-sm: 640px;   /* Tablet */
--container-md: 768px;   /* Tablet landscape */
--container-lg: 1024px;  /* Desktop */
--container-xl: 1280px;  /* Large desktop */
--container-2xl: 1536px; /* Extra large */

/* Content width */
--content-width: 1200px; /* Max content width */
```

### 4.3 Border Radius

```css
--radius-sm: 0.25rem;   /* 4px - Small elements */
--radius-md: 0.5rem;    /* 8px - Buttons, inputs */
--radius-lg: 0.75rem;   /* 12px - Cards */
--radius-xl: 1rem;      /* 16px - Modals */
--radius-full: 9999px;  /* Pills, avatars */
```

### 4.4 Shadows

```css
/* Elevation shadows */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

/* Focus shadow */
--shadow-focus: 0 0 0 3px rgba(255, 107, 53, 0.3);
```

---

## 5. Components

### 5.1 Buttons

#### Primary Button
```css
.btn-primary {
  background: var(--primary-500);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--primary-600);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: white;
  color: var(--primary-500);
  border: 2px solid var(--primary-500);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
}
```

#### Sizes
- Small: `padding: 0.5rem 1rem; font-size: 0.875rem`
- Medium: `padding: 0.75rem 1.5rem; font-size: 1rem` (default)
- Large: `padding: 1rem 2rem; font-size: 1.125rem`

### 5.2 Input Fields

```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: border-color 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: var(--shadow-focus);
}

.input::placeholder {
  color: var(--gray-400);
}

.input:disabled {
  background: var(--gray-100);
  cursor: not-allowed;
}

/* Error state */
.input.error {
  border-color: var(--error-main);
}
```

### 5.3 Recipe Card

```
┌─────────────────────────┐
│   [Recipe Image]        │
│                         │
├─────────────────────────┤
│ Recipe Title            │
│ ⭐ 4.5  ⏱️ 25 min       │
│ 🏷️ Italian, Quick       │
│                         │
│ [❤️ Favorite] [⋮ Menu]  │
└─────────────────────────┘
```

**Specifications**:
- Width: 280px (mobile), 320px (desktop)
- Image aspect ratio: 4:3
- Corner radius: 12px
- Shadow: `shadow-md`
- Hover: Lift effect with `shadow-lg`

```css
.recipe-card {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  cursor: pointer;
}

.recipe-card:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-4px);
}

.recipe-card__image {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  background: var(--gray-200);
}

.recipe-card__content {
  padding: var(--space-4);
}

.recipe-card__title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-2);
  color: var(--gray-900);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-card__meta {
  display: flex;
  gap: var(--space-4);
  font-size: var(--text-sm);
  color: var(--gray-600);
  margin-bottom: var(--space-3);
}

.recipe-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.recipe-card__tag {
  background: var(--gray-100);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  color: var(--gray-700);
}
```

### 5.4 Tags

```css
.tag {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

/* Default tag */
.tag--default {
  background: var(--gray-100);
  color: var(--gray-700);
}

/* Primary tag */
.tag--primary {
  background: var(--primary-100);
  color: var(--primary-700);
}

/* Removable tag */
.tag--removable {
  padding-right: var(--space-2);
}
```

### 5.5 Modal/Dialog

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: var(--radius-xl);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
}

.modal__header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--gray-200);
}

.modal__body {
  padding: var(--space-6);
}

.modal__footer {
  padding: var(--space-6);
  border-top: 1px solid var(--gray-200);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}
```

### 5.6 Navigation Bar

```
┌────────────────────────────────────────────────┐
│ [Logo] Recipes Collections Meal Plan Shopping  │
│                         [Search] [Avatar] [⚙️]  │
└────────────────────────────────────────────────┘
```

**Specifications**:
- Height: 64px
- Background: White (light mode), `dark-surface` (dark mode)
- Shadow: `shadow-sm`
- Sticky position

```css
.navbar {
  height: 64px;
  background: white;
  border-bottom: 1px solid var(--gray-200);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.navbar__container {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 0 var(--space-4);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar__logo {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--primary-500);
}

.navbar__links {
  display: flex;
  gap: var(--space-6);
}

.navbar__link {
  color: var(--gray-700);
  text-decoration: none;
  font-weight: var(--font-medium);
  transition: color 0.2s ease;
}

.navbar__link:hover {
  color: var(--primary-500);
}

.navbar__link--active {
  color: var(--primary-500);
  border-bottom: 2px solid var(--primary-500);
}
```

### 5.7 Sidebar

```css
.sidebar {
  width: 280px;
  background: var(--gray-50);
  border-right: 1px solid var(--gray-200);
  height: calc(100vh - 64px);
  position: sticky;
  top: 64px;
  padding: var(--space-6);
  overflow-y: auto;
}

.sidebar__section {
  margin-bottom: var(--space-6);
}

.sidebar__title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  color: var(--gray-500);
  margin-bottom: var(--space-3);
}

.sidebar__item {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.2s ease;
}

.sidebar__item:hover {
  background: var(--gray-100);
}

.sidebar__item--active {
  background: var(--primary-100);
  color: var(--primary-700);
}
```

### 5.8 Loading Spinner

```css
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--gray-200);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### 5.9 Toast Notifications

```css
.toast {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  min-width: 300px;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  animation: slideIn 0.3s ease;
}

.toast--success {
  background: var(--success-main);
  color: white;
}

.toast--error {
  background: var(--error-main);
  color: white;
}

.toast--info {
  background: var(--info-main);
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

---

## 6. Page Layouts

### 6.1 Dashboard/Home Page

```
┌─────────────────────────────────────────────────────┐
│ Navbar                                               │
├─────────┬───────────────────────────────────────────┤
│ Sidebar │ Main Content                              │
│         │                                            │
│ Quick   │ ┌──────────────────────────────────────┐ │
│ Access  │ │ Search Bar                           │ │
│ - All   │ └──────────────────────────────────────┘ │
│ - Fav   │                                            │
│ - Tags  │ Filter: [All ▼] [Tags ▼] [Time ▼]        │
│         │                                            │
│ Coll.   │ ┌────┐ ┌────┐ ┌────┐ ┌────┐              │
│ - Lunch │ │Card│ │Card│ │Card│ │Card│              │
│ - Dinner│ └────┘ └────┘ └────┘ └────┘              │
│         │ ┌────┐ ┌────┐ ┌────┐ ┌────┐              │
│         │ │Card│ │Card│ │Card│ │Card│              │
│         │ └────┘ └────┘ └────┘ └────┘              │
│         │                                            │
└─────────┴───────────────────────────────────────────┘
```

### 6.2 Recipe Detail Page

```
┌─────────────────────────────────────────────────────┐
│ Navbar                                               │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ← Back to Recipes                                   │
│                                                      │
│ ┌────────────────┐    Recipe Title                  │
│ │                │    ⭐ 4.5 (12 ratings)            │
│ │  Recipe Image  │    ⏱️ Prep: 10m | Cook: 15m       │
│ │                │    🍽️ Servings: 4                  │
│ └────────────────┘    🏷️ Italian, Quick, Pasta       │
│                                                      │
│ [❤️ Favorite] [📋 Add to Plan] [🛒 Shopping List]    │
│                                                      │
│ ─────────────────────────────────────────────────   │
│                                                      │
│ Description text goes here...                        │
│                                                      │
│ ───────────────────────────────────────────────────  │
│                                                      │
│ Ingredients            Instructions                  │
│ ┌──────────────┐      ┌──────────────────────┐      │
│ │ ☐ 400g pasta│      │ 1. Boil water...     │      │
│ │ ☐ 150g bacon│      │ 2. Cook pasta...     │      │
│ │ ☐ 2 eggs    │      │ 3. Fry bacon...      │      │
│ └──────────────┘      └──────────────────────┘      │
│                                                      │
│ Notes:                                               │
│ [User notes textarea]                                │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 6.3 Meal Planner Page

```
┌─────────────────────────────────────────────────────┐
│ Navbar                                               │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Meal Planner         Week of Dec 5-11   [◀ ▶]      │
│                                                      │
│ ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐        │
│ │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun │        │
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤        │
│ │🍳   │🍳   │🍳   │🍳   │🍳   │🍳   │🍳   │        │
│ │[  ] │[  ] │[  ] │[  ] │[  ] │[  ] │[  ] │        │
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤        │
│ │🍽️   │🍽️   │🍽️   │🍽️   │🍽️   │🍽️   │🍽️   │        │
│ │[Rec]│[  ] │[Rec]│[  ] │[Rec]│[  ] │[  ] │        │
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤        │
│ │🌙   │🌙   │🌙   │🌙   │🌙   │🌙   │🌙   │        │
│ │[Rec]│[Rec]│[  ] │[Rec]│[Rec]│[Rec]│[Rec]│        │
│ └─────┴─────┴─────┴─────┴─────┴─────┴─────┘        │
│                                                      │
│ [+ Add Recipe] [Generate Shopping List]              │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 6.4 Shopping List Page

```
┌─────────────────────────────────────────────────────┐
│ Navbar                                               │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Shopping Lists                                       │
│                                                      │
│ ┌────────────────────────────────────┐              │
│ │ Weekly Groceries        [⋮]        │              │
│ │ 12/28 checked • Updated 2 hours ago│              │
│ └────────────────────────────────────┘              │
│                                                      │
│ ───── Produce ─────                                  │
│ ☑️ Tomatoes (6 pieces)                               │
│ ☐ Lettuce (1 head)                                  │
│ ☐ Onions (3 pieces)                                 │
│                                                      │
│ ───── Dairy ─────                                    │
│ ☑️ Milk (2 liters)                                   │
│ ☐ Eggs (12 pieces)                                  │
│                                                      │
│ ───── Pantry ─────                                   │
│ ☐ Pasta (800g)                                      │
│ ☐ Rice (1kg)                                        │
│                                                      │
│ [+ Add Item]                                         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 6.5 Recipe Import Page

```
┌─────────────────────────────────────────────────────┐
│ Navbar                                               │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Import Recipe                                        │
│                                                      │
│ ┌──────────────────────────────────────────────┐    │
│ │ 🔗 From URL                                   │    │
│ │ [Paste recipe URL here...      ] [Import]    │    │
│ └──────────────────────────────────────────────┘    │
│                                                      │
│ ┌──────────────────────────────────────────────┐    │
│ │ 📷 From Image                                 │    │
│ │                                               │    │
│ │     [Drag & drop or click to upload]         │    │
│ │                                               │    │
│ └──────────────────────────────────────────────┘    │
│                                                      │
│ ┌──────────────────────────────────────────────┐    │
│ │ ✍️ Manual Entry                               │    │
│ │ [Create Recipe Manually] ──────────────────>  │    │
│ └──────────────────────────────────────────────┘    │
│                                                      │
│ Recent Imports:                                      │
│ • Amazing Cake - Completed ✓                         │
│ • Pasta Recipe - Processing...                       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 7. User Flows

### 7.1 Registration & Login Flow

```
Landing Page
    ↓
[Sign Up] or [Login]
    ↓
┌─ Sign Up Form ─────────────┐
│ Email                       │
│ Password                    │
│ Confirm Password            │
│ [Create Account]            │
└────────────────────────────┘
    ↓
Email Verification (optional)
    ↓
Dashboard (First Time User)
    ↓
Onboarding Tutorial (optional)
    ↓
Main Dashboard
```

### 7.2 Import Recipe from URL Flow

```
Dashboard
    ↓
Click [+ Add Recipe] or [Import]
    ↓
Import Page
    ↓
Paste URL → Click [Import]
    ↓
Loading Spinner
    ↓
┌─ Preview Imported Recipe ──┐
│ [Edit fields if needed]     │
│ [Save] or [Cancel]          │
└────────────────────────────┘
    ↓
Recipe saved to library
    ↓
Redirect to Recipe Detail Page
```

### 7.3 Meal Planning Flow

```
Recipes Page
    ↓
Select Recipe → Click [Add to Meal Plan]
    ↓
┌─ Meal Plan Dialog ─────────┐
│ Date: [Date Picker]         │
│ Meal: [Breakfast ▼]         │
│ Servings: [4]               │
│ [Add to Plan]               │
└────────────────────────────┘
    ↓
Added to Meal Plan
    ↓
Toast: "Added to meal plan"
    ↓
Optional: [Generate Shopping List]
    ↓
Shopping List Created
```

### 7.4 Shopping List Flow

```
Meal Plan Page
    ↓
Click [Generate Shopping List]
    ↓
┌─ Generate List Dialog ─────┐
│ List Name: [This Week]      │
│ Date Range: [Dec 5-11]      │
│ [Generate]                  │
└────────────────────────────┘
    ↓
Processing...
    ↓
Shopping List Page
    ↓
Check off items as shopping
    ↓
Mark all as purchased
```

---

## 8. Wireframes

### 8.1 Mobile Home Screen

```
┌──────────────────┐
│ ☰  Recipe App 🔍 │
├──────────────────┤
│ Search recipes...│
├──────────────────┤
│ [All] [Favorites]│
│ [Quick] [Italian]│
├──────────────────┤
│ ┌──────────────┐ │
│ │   [Image]    │ │
│ │              │ │
│ │ Recipe Title │ │
│ │ ⭐4.5 ⏱️25min │ │
│ └──────────────┘ │
│                  │
│ ┌──────────────┐ │
│ │   [Image]    │ │
│ │              │ │
│ │ Recipe Title │ │
│ │ ⭐4.2 ⏱️40min │ │
│ └──────────────┘ │
│                  │
│      [+]         │
└──────────────────┘
```

### 8.2 Tablet Layout

```
┌─────────────────────────────────────┐
│ Recipe App     [Search]  [Avatar]   │
├─────────┬───────────────────────────┤
│ ☰ Menu  │ ┌──────┐ ┌──────┐ ┌─────┐│
│         │ │[Img] │ │[Img] │ │[Img]││
│ All     │ │Title │ │Title │ │Title││
│ Fav     │ └──────┘ └──────┘ └─────┘│
│ Recent  │                            │
│ Tags    │ ┌──────┐ ┌──────┐ ┌─────┐│
│         │ │[Img] │ │[Img] │ │[Img]││
│ Coll.   │ │Title │ │Title │ │Title││
│ - Lunch │ └──────┘ └──────┘ └─────┘│
│ - Dinner│                            │
│         │           [+]              │
└─────────┴───────────────────────────┘
```

### 8.3 Desktop Full Layout

```
┌──────────────────────────────────────────────────────────────┐
│ [Logo] Recipe App  Recipes  Collections  Meal Plan  Shopping │
│                              [Search recipes...]  [🔔] [👤]   │
├────────────┬─────────────────────────────────────────────────┤
│            │ My Recipes                    Sort: Recent ▼    │
│ Quick      │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│ - All (45) │ │ [Image]│ │ [Image]│ │ [Image]│ │ [Image]│   │
│ - Fav (12) │ │        │ │        │ │        │ │        │   │
│ - Recent   │ │ Title  │ │ Title  │ │ Title  │ │ Title  │   │
│            │ │ ⭐ 4.5  │ │ ⭐ 4.2  │ │ ⭐ 5.0  │ │ ⭐ 4.8  │   │
│ Tags       │ └────────┘ └────────┘ └────────┘ └────────┘   │
│ 🏷️ Italian │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│ 🏷️ Quick   │ │ [Image]│ │ [Image]│ │ [Image]│ │ [Image]│   │
│ 🏷️ Dessert │ │        │ │        │ │        │ │        │   │
│            │ │ Title  │ │ Title  │ │ Title  │ │ Title  │   │
│ Coll.      │ │ ⭐ 4.3  │ │ ⭐ 4.9  │ │ ⭐ 4.1  │ │ ⭐ 4.7  │   │
│ 📁 Dinner  │ └────────┘ └────────┘ └────────┘ └────────┘   │
│ 📁 Lunch   │                                                 │
│ 📁 Dessert │                      [Load More]                │
│            │                                                 │
│ [+ New]    │                                                 │
└────────────┴─────────────────────────────────────────────────┘
```

---

## 9. Responsive Design

### 9.1 Breakpoints

```css
/* Mobile First Approach */
/* Extra Small: 0-639px (default) */

@media (min-width: 640px) {
  /* Small devices (sm): 640px+ */
}

@media (min-width: 768px) {
  /* Medium devices (md): 768px+ */
}

@media (min-width: 1024px) {
  /* Large devices (lg): 1024px+ */
}

@media (min-width: 1280px) {
  /* Extra large (xl): 1280px+ */
}

@media (min-width: 1536px) {
  /* 2X Extra large (2xl): 1536px+ */
}
```

### 9.2 Responsive Recipe Grid

```css
.recipe-grid {
  display: grid;
  gap: var(--space-6);
  padding: var(--space-4);
}

/* Mobile: 1 column */
.recipe-grid {
  grid-template-columns: 1fr;
}

/* Tablet: 2 columns */
@media (min-width: 640px) {
  .recipe-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: 3-4 columns */
@media (min-width: 1024px) {
  .recipe-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .recipe-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### 9.3 Mobile Navigation

On mobile, sidebar becomes bottom navigation or hamburger menu:

```
┌──────────────────┐
│ ☰ Recipe App  🔍 │ ← Hamburger + Search
├──────────────────┤
│                  │
│   Main Content   │
│                  │
├──────────────────┤
│ 🏠 📚 📅 🛒 👤   │ ← Bottom Tab Bar
└──────────────────┘
```

### 9.4 Touch Targets

All interactive elements on mobile:
- Minimum height: 44px
- Minimum width: 44px
- Adequate spacing between elements (min 8px)

---

## 10. Accessibility

### 10.1 WCAG 2.1 AA Compliance

**Color Contrast**:
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

**Keyboard Navigation**:
- All interactive elements focusable
- Logical tab order
- Visible focus indicators
- Skip links for main content

**Screen Readers**:
- Semantic HTML elements
- ARIA labels where needed
- Alt text for all images
- Form labels properly associated

### 10.2 Semantic HTML

```html
<!-- Use proper heading hierarchy -->
<h1>My Recipes</h1>
<h2>Quick Dinners</h2>
<h3>Spaghetti Carbonara</h3>

<!-- Semantic navigation -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/recipes">Recipes</a></li>
  </ul>
</nav>

<!-- Semantic article for recipe -->
<article>
  <header>
    <h2>Recipe Title</h2>
  </header>
  <section aria-label="Ingredients">
    <!-- ingredients -->
  </section>
  <section aria-label="Instructions">
    <!-- instructions -->
  </section>
</article>
```

### 10.3 ARIA Labels

```html
<!-- Button with icon only -->
<button aria-label="Add to favorites">
  <HeartIcon />
</button>

<!-- Loading state -->
<div role="status" aria-live="polite">
  Loading recipes...
</div>

<!-- Form validation -->
<input 
  type="email" 
  aria-describedby="email-error"
  aria-invalid="true"
/>
<span id="email-error" role="alert">
  Please enter a valid email
</span>
```

### 10.4 Focus Management

```css
/* Visible focus indicator */
*:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* Don't remove focus for keyboard users */
*:focus:not(:focus-visible) {
  outline: none;
}

*:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

### 10.5 Motion & Animation

Respect user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. Animation & Transitions

### 11.1 Standard Transitions

```css
/* Hover effects */
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;

/* Example usage */
.button {
  transition: all var(--transition-base);
}
```

### 11.2 Page Transitions

```css
/* Fade in page */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.page-enter {
  animation: fadeIn 300ms ease;
}
```

### 11.3 Micro-interactions

```css
/* Button press effect */
.button:active {
  transform: scale(0.98);
}

/* Card hover */
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

/* Loading pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading {
  animation: pulse 2s ease-in-out infinite;
}
```

---

## 12. Icons

### 12.1 Icon Library

**Recommended**: Heroicons, Lucide Icons, or React Icons

**Common Icons Needed**:
- Heart (favorite)
- Star (rating)
- Clock (time)
- Users (servings)
- Tag (categories)
- Calendar (meal plan)
- Shopping cart
- Plus (add)
- Search
- Menu (hamburger)
- X (close)
- Edit
- Delete
- Share
- Download

### 12.2 Icon Usage

```css
.icon {
  width: 20px;
  height: 20px;
  display: inline-block;
  vertical-align: middle;
}

.icon--sm { width: 16px; height: 16px; }
.icon--lg { width: 24px; height: 24px; }
.icon--xl { width: 32px; height: 32px; }
```

---

## 13. Dark Mode

### 13.1 Dark Mode Colors

```css
:root[data-theme="dark"] {
  --bg-primary: #1A1A1A;
  --bg-secondary: #2D2D2D;
  --bg-tertiary: #3D3D3D;
  
  --text-primary: #E5E5E5;
  --text-secondary: #A0A0A0;
  --text-tertiary: #707070;
  
  --border: #404040;
  
  /* Primary color stays same or slightly adjusted */
  --primary-500: #FF7952;
}
```

### 13.2 Dark Mode Toggle

```html
<button aria-label="Toggle dark mode">
  <SunIcon /> / <MoonIcon />
</button>
```

---

## 14. Performance Considerations

### 14.1 Image Optimization

- Use WebP format with fallback
- Lazy load images below fold
- Use appropriate sizes for different devices
- Implement blur-up technique for recipe images

```html
<img 
  src="recipe-small.webp"
  srcset="recipe-small.webp 320w,
          recipe-medium.webp 640w,
          recipe-large.webp 1024w"
  sizes="(max-width: 640px) 100vw,
         (max-width: 1024px) 50vw,
         33vw"
  loading="lazy"
  alt="Recipe title"
/>
```

### 14.2 Code Splitting

- Route-based code splitting
- Lazy load modals and dialogs
- Defer non-critical components

---

## Appendix: Component Checklist

- [x] Buttons (Primary, Secondary, Icon)
- [x] Input fields (Text, Email, Password, Textarea)
- [x] Recipe cards
- [x] Navigation bar
- [x] Sidebar
- [x] Modal/Dialog
- [x] Toast notifications
- [x] Loading spinner
- [x] Tags
- [x] Dropdowns/Select
- [x] Checkboxes
- [x] Radio buttons
- [x] Toggle switches
- [x] Pagination
- [x] Breadcrumbs
- [x] Tabs
- [x] Accordion
- [x] Avatar
- [x] Badge/Pill
- [x] Progress bar
- [x] Empty states
- [x] Error states

---

**Document Version**: 1.0  
**Last Updated**: December 5, 2025  
**Design System Status**: Ready for Implementation
