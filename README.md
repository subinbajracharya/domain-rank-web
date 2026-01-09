# Domain Ranking App - Frontend

A Nuxt 3 web application for comparing domain rankings using Tranco ranking history.

## Features

- **Compare multiple domains** - Enter up to 10 domains to compare side-by-side
- **Visual ranking history** - Interactive line chart showing rank changes over time
- **Shareable URLs** - Copy the URL to share the same domain comparison
- **Latest rankings table** - Quick view of the most recent rank for each domain

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

## Tech Stack

- **Frontend**: Nuxt 4 / Vue 3
- **Styling**: Bootstrap 5
- **Charts**: Chart.js with vue-chartjs
- **Runtime Config**: Nuxt runtime config for API base URL

## Backend

See [domain-rank-api](../domain-rank-api/README.md) for backend details:

- **Framework**: NestJS
- **Database**: PostgreSQL (via Prisma ORM)
- **External API**: Tranco List API
- **Caching**: 24-hour in-database cache

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

## API Integration

The frontend communicates with the backend API at the endpoint:

```
GET /rankings/{domains}
```

Where `{domains}` is a comma-separated list of domain names.

Example response:

```json
{
  "facebook.com": {
    "domain": "facebook.com",
    "labels": ["2024-01-01", "2024-01-02", ...],
    "ranks": [3, 3, 4, ...]
  }
}
```
