# VetLink Deployment Guide

## Project Layout

- `Backend/Backend`: Spring Boot backend for Render
- `vetLink`: Vite frontend for Vercel

## Docker

### Backend

Build:

```bash
docker build -t vetlink-backend ./Backend/Backend
```

Run:

```bash
docker run --rm -p 8081:8081 \
  -e PORT=8081 \
  -e DB_URL=jdbc:postgresql://host:5432/dbname \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=secret \
  -e JWT_SECRET=replace_me \
  -e CORS_ALLOWED_ORIGINS=http://localhost:5173 \
  vetlink-backend
```

Required backend environment variables:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`

Optional backend environment variables:

- `PORT`
- `SPRING_PROFILES_ACTIVE`
- `DDL_AUTO`
- `SHOW_SQL`
- `APP_LOG_LEVEL`
- `CORS_ALLOWED_ORIGINS`
- `SEED_ADMIN`

Important:

- The backend writes uploaded files to the container filesystem under `uploads/`.
- On Render, local disk is ephemeral unless you attach persistent storage or move uploads to object storage.

### Frontend

Build:

```bash
docker build -t vetlink-frontend \
  --build-arg VITE_API_URL=https://your-backend.onrender.com/api \
  ./vetLink
```

Run:

```bash
docker run --rm -p 3000:80 vetlink-frontend
```

Required frontend build variable:

- `VITE_API_URL`

## Render Backend

This repo includes `render.yaml` for a Docker-based backend deploy.

Manual setup values:

- Root directory: `Backend/Backend`
- Runtime: `Docker`

Environment variables to set in Render:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `CORS_ALLOWED_ORIGINS`

Recommended values:

- `SPRING_PROFILES_ACTIVE=render`
- `DDL_AUTO=none`
- `SHOW_SQL=false`
- `APP_LOG_LEVEL=INFO`
- `SEED_ADMIN=false`

## Vercel Frontend

This repo includes `vetLink/vercel.json` for SPA routing.

Manual setup values:

- Root directory: `vetLink`
- Framework preset: `Vite`
- Build command: `npm run build:client`
- Output directory: `dist/spa`

Environment variable to set in Vercel:

- `VITE_API_URL=https://your-backend.onrender.com/api`

## Recommended Deployment Order

1. Deploy the backend to Render.
2. Copy the live backend URL.
3. Set `VITE_API_URL` in Vercel.
4. Deploy the frontend to Vercel.
5. Update backend `CORS_ALLOWED_ORIGINS` with the final Vercel URL.
