# Mirai AI

Monorepo for the Mirai AI project.

## Structure

- `backend/`: Python backend service
- `frontend/`: Vite + TypeScript frontend app

## Local setup

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

## GitHub push

```powershell
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

