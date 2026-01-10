# Plod - Project Context

## About This Project
Plod is a minimalist PWA for casual runners. It syncs runs from Strava and adds a health-focused layer with weather, air quality, and effort ratings. Built for two users (Elliot and Charlotte) - not a commercial product.

## Philosophy
- Health and consistency over performance
- No pace/speed metrics - this isn't about getting faster
- Calm, minimal UI - not sporty or aggressive
- "Quiet proof" of progress, not gamification
- The name "Plod" is intentionally humble

## Tech Stack
- Next.js 14+ (App Router) with TypeScript
- Tailwind CSS + shadcn/ui (dark theme, "new-york" style)
- Supabase (PostgreSQL + Auth)
- Strava API for activity sync
- OpenWeatherMap + OpenAQ for conditions
- Deployed on Vercel

## Key Directories
- `app/` - Next.js pages and API routes
- `components/` - React components (ui/ for shadcn, features/ for app-specific)
- `lib/` - Utilities and API clients

## Code Style
- Use TypeScript strict mode
- Prefer named exports
- Use ES modules (import/export), not CommonJS
- Components should be functional with hooks
- Keep components small and focused

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## Important Rules
1. Never show pace or speed in the UI
2. Use muted, calming colors - no bright sports colors
3. Mobile-first always (375px width minimum)
4. Dark mode is default
5. Keep the UI minimal - when in doubt, remove elements

## When Making Changes
1. Create a new branch for features
2. Test on mobile viewport
3. Commit with conventional commits (feat:, fix:, etc.)
4. Don't commit .env files or API keys
