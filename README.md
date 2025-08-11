# Netflix Clone - Frontend

A modern Netflix clone built with Next.js 15, featuring authentication, movie/TV browsing, and user profiles.

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Copy the environment template
cp .env.example .env.local

# Edit .env.local with your actual values
# NEVER commit .env.local to git!
```

### 2. Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `NEXTAUTH_URL` | Your app URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Random secret for auth | Generate with `openssl rand -base64 32` |
| `TMDB_API_KEY` | The Movie Database API key | Get from [TMDB](https://www.themoviedb.org/settings/api) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | From Google Cloud Console |

### 3. Install & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🛠️ Development

- **Framework**: Next.js 15 with App Router
- **Database**: MongoDB with Prisma ORM  
- **Authentication**: NextAuth.js with Google OAuth
- **Styling**: Tailwind CSS
- **API**: TMDB for movie/TV data

## 🔒 Security

- Environment files are gitignored
- Secrets managed via environment variables
- HTTPS required for authentication
- OAuth with Google for secure login

## 📦 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
```