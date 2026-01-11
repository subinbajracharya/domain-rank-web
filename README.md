# Domain Ranking App - Frontend

A Nuxt 3 web application for comparing domain rankings using Tranco ranking history.

---

## Why This Application Exists

**The Problem:**
Raw ranking data is hard to interpret. Numbers without context don't tell the full story:

- Is a domain's ranking improving or declining?
- How does a domain compare to competitors?
- What's the trend over the past 30 days?

**The Challenge:**
Existing ranking tools (Tranco website, SimilarWeb) are:

- Designed for single-domain lookups
- Lack comparison features
- Don't show historical trends clearly
- Hard to share with stakeholders

**Our Solution:**
Build a visualization tool that:

1. Accepts multiple domains for side-by-side comparison
2. Renders interactive charts showing ranking trends
3. Generates shareable URLs for reports
4. Provides instant visual feedback

This transforms raw numbers into actionable insights.

---

## Thought Process: UX/UI Decisions

### Why Bootstrap 5?

- **Familiar patterns**: Users recognize the look and feel
- **Responsive**: Works on desktop, tablet, and mobile
- **Components**: Pre-built forms, buttons, cards, tables
- **Time savings**: Focus on functionality over styling

### Why Chart.js with vue-chartjs?

- **Interactive**: Hover, zoom, and tooltips out of the box
- **Responsive**: Auto-resizes to container
- **Vue integration**: vue-chartjs provides Vue 3 composables
- **Familiar**: Widely used, good documentation

### Why Domain Input as Text Area?

- **Fast entry**: Paste a list of domains from anywhere
- **Flexible**: One per line, with or without http://
- **Validation**: Clear error messages for invalid inputs

### Why Shareable URLs?

- **Collaboration**: Send a link, not a screenshot
- **Bookmarkable**: Users can save their favorite comparisons
- **Stateless**: No user accounts needed

---

## Features

- **Compare multiple domains** - Enter up to 10 domains to compare side-by-side
- **Visual ranking history** - Interactive line chart showing rank changes over time
- **Shareable URLs** - Copy the URL to share the same domain comparison
- **Latest rankings table** - Quick view of the most recent rank for each domain
- **Responsive design** - Works on desktop and mobile devices

---

## Prerequisites

- Node.js 18+
- npm, pnpm, or yarn
- Backend API running (see [domain-rank-api](../domain-rank-api/README.md))

## Setup

Install dependencies:

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory:

```env
NUXT_PUBLIC_API_BASE=http://localhost:3000
```

This should point to the backend API URL.

## Development Server

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3001`

## Production

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Usage

1. Open the app at `http://localhost:3001`
2. Enter domain names (one per line), e.g.:
   ```
   facebook.com
   google.com
   twitter.com
   ```
3. Click **Compare** to see the ranking chart and data

---

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        index.vue                            │
│                  (Main Page Container)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────────────────────┐│
│  │   DomainForm    │───>│         RankChart               ││
│  │  (User Input)   │    │    (Interactive Chart)          ││
│  └─────────────────┘    └─────────────────────────────────┘│
│         │                        │                          │
│         │    API Call            │                          │
│         └────────────────────────┘                          │
│                      │                                      │
│              ┌───────▼───────┐                              │
│              │   API Response │                              │
│              │   Processing   │                              │
│              └───────────────┘                              │
└─────────────────────────────────────────────────────────────┘
```

**Component Responsibilities:**

- **DomainForm**: Collect user input, validate domains, handle submission
- **RankChart**: Render Chart.js visualization, handle interactions
- **index.vue**: Orchestrate API calls, manage state, handle errors

---

## Tech Stack

- **Frontend**: Nuxt 4 / Vue 3
- **Styling**: Bootstrap 5
- **Charts**: Chart.js with vue-chartjs
- **Runtime Config**: Nuxt runtime config for API base URL

---

## Backend

See [domain-rank-api](../domain-rank-api/README.md) for backend details:

- **Framework**: NestJS
- **Database**: PostgreSQL (via Prisma ORM)
- **External API**: Tranco List API
- **Caching**: 24-hour in-database cache

---

## Project Structure

```
domain-rank-web/
├── app/
│   ├── components/
│   │   ├── DomainForm.vue    # Domain input form
│   │   └── RankChart.vue     # Ranking history chart
│   ├── pages/
│   │   └── index.vue         # Main page
│   └── app.vue               # Root component
├── public/
├── nuxt.config.ts            # Nuxt configuration
└── package.json
```

---

## API Integration

The frontend communicates with the backend API at the endpoint:

```
GET /rankings/{domains}
```

Where `{domains}` is a comma-separated list of domain names.

Example request:

```
GET /rankings/facebook.com,google.com
```

Example response:

```json
{
  "facebook.com": {
    "domain": "facebook.com",
    "labels": ["2024-01-01", "2024-01-02", "2024-01-03", ...],
    "ranks": [3, 3, 4, ...]
  },
  "google.com": {
    "domain": "google.com",
    "labels": ["2024-01-01", "2024-01-02", "2024-01-03", ...],
    "ranks": [1, 1, 1, ...]
  }
}
```

**Data Flow:**

1. User enters domains → DomainForm validates
2. API request made → Backend fetches/caches data
3. Response received → Data transformed for Chart.js
4. Chart renders → User sees ranking trends

---

## User Journey

```
1. User opens app
   ↓
2. Enters domains (one per line)
   ↓
3. Clicks "Compare"
   ↓
4. Loading state shown
   ↓
5. If error: Show friendly message
   ↓
6. If success: Show chart + rankings table
   ↓
7. User can share URL or compare more domains
```

---

## Design Decisions

### Color Coding

Each domain gets a unique color in the chart for easy distinction.

### Reverse Y-Axis

Ranking charts use reverse axis (1 at top) because:

- Users expect #1 to be at the top
- Lower numbers = better ranking
- Makes trends (up/down) intuitive

### Error Handling

- Invalid domains: Show specific error messages
- API failures: Suggest retry with different domains
- Empty results: Explain why (not in Tranco Top 1M)
