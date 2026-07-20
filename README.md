# Sikka - Smart Business Directory

A modern, mobile-first business directory platform similar to Yellow Pages but faster and app-like.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js + Express.js
- **Database**: Firebase Cloud Firestore
- **Auth**: Firebase Auth (Phone OTP + Google)
- **Search**: Meilisearch

## Quick Start

### Prerequisites

1. Node.js 18+
2. Firebase project (free tier works)
3. Meilisearch instance (optional, for search)

### Setup

```bash
cd sikka
npm install
cp .env.example .env
```

### Configure .env

Edit `.env` with your Firebase credentials:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=your@email.com
```

### Run

```bash
# Seed database (first time only)
npm run seed

# Start development server
npm run dev

# Or production
npm start
```

Open http://localhost:3000

## Project Structure

```
sikka/
├── backend/
│   ├── config/          # Firebase & Meilisearch config
│   ├── controllers/     # Business logic
│   ├── middleware/       # Auth middleware
│   ├── routes/          # API routes
│   ├── server.js        # Express app
│   └── seed.js          # Database seeder
├── frontend/
│   ├── assets/          # Icons & images
│   ├── css/             # Styles
│   ├── js/              # Client-side JS
│   └── index.html       # SPA entry
├── docs/                # Documentation
├── .env.example         # Environment template
└── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| GET | /api/auth/profile | Get profile |
| PUT | /api/auth/profile | Update profile |
| POST | /api/auth/favorites/:id | Toggle favorite |
| GET | /api/auth/favorites | Get favorites |
| GET | /api/businesses | List businesses |
| POST | /api/businesses | Create business |
| GET | /api/businesses/:id | Get business |
| PUT | /api/businesses/:id | Update business |
| DELETE | /api/businesses/:id | Delete business |
| POST | /api/businesses/:id/reviews | Add review |
| GET | /api/businesses/:id/reviews | Get reviews |
| GET | /api/posts | List posts |
| POST | /api/posts | Create post |
| GET | /api/posts/slug/:slug | Get post |
| GET | /api/search/businesses | Search businesses |
| GET | /api/search/all | Search all |
| GET | /api/categories | List categories |
