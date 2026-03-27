# PILB Deployment Guide

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 13+
- Stellar Testnet Account
- Safaricom M-Pesa Business Account (Daraja API)

## Environment Setup

### Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=3000
STELLAR_NETWORK=testnet
STELLAR_SERVER_URL=https://horizon-testnet.stellar.org
SERVICE_WALLET_ADDRESS=your_stellar_public_key
SERVICE_WALLET_SECRET=your_stellar_secret
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
DATABASE_URL=postgresql://user:password@localhost:5432/pilb
```

### Frontend

```bash
cd frontend
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:3000/api
VITE_STELLAR_NETWORK=testnet
```

## Running Locally

### With Docker

```bash
docker-compose up --build
```

### Manual Setup

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Production Deployment

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up --build
```

### Heroku

```bash
heroku create pilb-app
git push heroku main
```

## Verification

- Backend: http://localhost:3000/api/health
- Frontend: http://localhost:3001

---

**Related Documentation:**

- [Architecture Overview](./ARCHITECTURE.md) - System design
- [API Reference](./API.md) - Endpoint documentation
