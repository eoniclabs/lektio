# Lektio

AI-driven study app – photograph textbooks, get interactive visual explanations with animations and voice narration.

## Tech Stack

- **Frontend:** React + TypeScript, Vite, Tailwind CSS, GSAP, KaTeX (PWA)
- **Backend:** C# / .NET 10, ASP.NET Core Minimal APIs
- **Database:** MongoDB (Atlas in production, Docker locally)
- **AI:** Claude API (Anthropic)
- **Hosting:** Hetzner

## Getting Started

### Prerequisites

- Node.js 22+
- .NET 10 SDK
- Docker (for local MongoDB)

### Development

```bash
# Start MongoDB
docker compose up -d

# Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173

# Backend
cd backend/Lektio.Api
dotnet run           # http://localhost:5000
```

## Project Structure

```
lektio/
├── frontend/          # React PWA (Vite + TypeScript)
├── backend/
│   └── Lektio.Api/    # .NET Minimal API
├── docker-compose.yml # Local MongoDB
└── .github/workflows/ # CI/CD
```
