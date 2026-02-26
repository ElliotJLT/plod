# 🏃 plod

A calm running app that cares about your health, not your PBs. PWA with Strava sync.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## What

Most running apps optimise for speed. Plod optimises for consistency. It syncs your runs from Strava, layers on weather and air quality data, and helps you plan your week around conditions — not pace targets. Built for runners who just want to keep moving.

## Quick Start

```bash
git clone https://github.com/ElliotJLT/plod.git
cd plod
npm install
cp .env.example .env  # fill in Supabase + Strava + weather API keys
npm run dev
```

## Features

- 📊 **Today dashboard** — current conditions, air quality, and weekly progress at a glance
- 🔄 **Strava sync** — automatic activity import
- 🌤️ **Weather + AQI** — real-time conditions to inform run decisions
- 📅 **Week planner** — drag-and-drop scheduling with cascade rescheduling
- 💪 **Effort ratings** — log how runs felt, not just how fast they were
- 🧠 **Training plans** — AI-generated half-marathon plans using 80/20 polarised training

## Tech

Next.js 14, TypeScript, Tailwind CSS, Supabase, Strava API, OpenWeatherMap, Leaflet.

## License

MIT
