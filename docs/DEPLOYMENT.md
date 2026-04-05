# StellarPay Deployment Guide

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- MongoDB 13+ (local or Atlas)
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
MPESA_INITIATOR_NAME=your_initiator_name
MPESA_INITIATOR_PASSWORD=your_initiator_password
MONGODB_URI=mongodb://localhost:27017/stellarpay
ENCRYPTION_KEY=your_32_character_encryption_key
FRONTEND_URL=http://localhost:5173
```

### Frontend

```bash
cd frontend
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:3000
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

### Manual Production

1. **Build frontend:**

```bash
cd frontend
npm run build
```

2. **Serve with nginx:**

```bash
docker build -t stellarpay-frontend .
docker run -p 80:80 stellarpay-frontend
```

### Cloud Platforms

#### Heroku

```bash
heroku create stellarpay-app
git push heroku main
```

#### Railway

```bash
railway init
railway up
```

#### DigitalOcean App Platform

Connect your repository to DigitalOcean and configure the app.

## Environment Variables for Production

### Backend

| Variable           | Description               | Example           |
| ------------------ | ------------------------- | ----------------- |
| PORT               | Server port               | 3000              |
| NODE_ENV           | Environment               | production        |
| MONGODB_URI        | MongoDB connection string | mongodb+srv://... |
| STELLAR_NETWORK    | Stellar network           | mainnet           |
| STELLAR_SECRET_KEY | Service wallet secret     | SCZ...            |
| MPESA_ENV          | M-Pesa environment        | production        |

### Frontend

| Variable             | Description     | Example                   |
| -------------------- | --------------- | ------------------------- |
| VITE_API_URL         | Backend API URL | https://api.stellarpay.io |
| VITE_STELLAR_NETWORK | Stellar network | mainnet                   |

## Verification

- Backend: http://localhost:3000/api/health
- Frontend: http://localhost:5173

## Cross-Border Payment Configuration

To enable cross-border payments, ensure the following countries are configured:

- Kenya (KE) - Default, 2.5% fee
- Uganda (UG) - 3.0% + 100 KES
- Tanzania (TZ) - 3.0% + 150 KES
- Nigeria (NG) - 4.5% + 500 KES
- Ghana (GH) - 4.0% + 400 KES
- South Africa (ZA) - 5.0% + 600 KES
- India (IN) - 5.5% + 800 KES
- United States (US) - 6.0% + 1000 KES
- United Kingdom (GB) - 5.5% + 900 KES
- European Union (EU) - 5.5% + 900 KES

## Security Considerations

1. Use HTTPS in production
2. Set `NODE_ENV=production`
3. Use strong encryption keys
4. Configure CORS properly
5. Enable rate limiting

---

**Related Documentation:**

- [Architecture Overview](./ARCHITECTURE.md) - System design
- [API Reference](./API.md) - Endpoint documentation
