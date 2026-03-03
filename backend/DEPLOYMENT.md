# Deployment Notes

## 1) Backend environment
Set these in production:

- `ENVIRONMENT=production`
- `SECRET_KEY=<long random secret>`
- `DATABASE_URL=<postgres connection string>`
- `FRONTEND_URL=<your frontend URL>`
- `CORS_ORIGINS=<comma separated allowed origins>`

OAuth (optional, for social login):

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

## 2) OAuth callback setup
Frontend callback route used by this project:

- `https://<your-frontend-domain>/auth/oauth/callback`

Configure the same redirect URI in:

- Google OAuth app
- GitHub OAuth app

## 3) Startup command
Use:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## 4) Health checks
Use:

- `GET /health`
- `GET /`

## 5) Smoke tests
Run from backend folder:

```powershell
powershell -ExecutionPolicy Bypass -File .\test_api.ps1
```

Run from frontend folder:

```powershell
powershell -ExecutionPolicy Bypass -File .\test_frontend.ps1
```
