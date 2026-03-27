# PILB - Anonymous M-Pesa Payments via Stellar

**Send Money, Keep Your Identity**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stellar](https://img.shields.io/badge/Stellar-Network-blue.svg)](https://stellar.org)
[![M-Pesa](https://img.shields.io/badge/M--Pesa-Integration-green.svg)](https://safaricom.co.ke)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)

## 📋 Table of Contents

- [About](#about)
- [Problem Statement](#problem-statement)
- [How It Works](#how-it-works)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Docker Setup](#docker-setup)
- [API Endpoints](#api-endpoints)
- [Security](#security)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [License](#license)

## About

PILB (Private, Instant, Low-Barrier Payments) is a revolutionary payment system that enables anonymous M-Pesa transfers using the Stellar blockchain. By leveraging cryptographic techniques and the Stellar network, PILB allows users to send money to anyone in Kenya via M-Pesa without revealing their identity.

## Problem Statement

In Kenya, financial privacy is a significant concern. When sending money through traditional mobile money services like M-Pesa, the sender's details are always visible to the recipient. This creates problems for:

- **Journalists and activists** who need to protect their sources
- **Business owners** who want to keep supplier relationships confidential
- **Individuals** who value financial privacy
- **Charitable organizations** that need to protect beneficiary information

PILB solves this by using the Stellar blockchain as an intermediary, ensuring that the sender's identity remains completely anonymous while still enabling seamless M-Pesa transfers.

## How It Works

PILB uses a clever two-step verification system to maintain anonymity:

1. **Payment Initiation**

   - User enters the amount and recipient's phone number
   - App generates a unique 6-digit verification code
   - The code is hashed using AES-256 encryption
   - Payment is sent to Stellar with the hash in the transaction memo

2. **Verification & Payout**
   - Backend watches the Stellar network for incoming payments
   - Once payment is confirmed, the system triggers M-Pesa B2C
   - Recipient receives the money via M-Pesa with no sender information
   - The 6-digit code is shared separately (via SMS, WhatsApp, etc.)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Sender    │────▶│   Stellar   │────▶│   Backend   │────▶│  Recipient  │
│  (Frontend) │     │  Network    │     │  Watcher    │     │   (M-Pesa)  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                                       │
      │  1. Send payment with hash           │
      │                                       │  4. M-Pesa B2C
      │         2. Confirm on chain          │     (no sender info)
      │                                       │
      │         3. Verify code               ▼
      │                              ┌─────────────┐
      │◀─────────────────────────────│   Recipient │
      │      5. Share code          │  gets money │
      └──────────────────────────────└─────────────┘
```

## Features

- **🔒 Complete Anonymity** - Sender details never reach the recipient
- **⚡ Fast Transactions** - Stellar confirms in 3-5 seconds
- **💰 Low Fees** - Stellar transactions cost a fraction of a cent
- **🌍 Global Reach** - Send from anywhere in the world
- **🔐 Bank-Grade Security** - AES-256 encryption, Stellar's immutable ledger
- **📱 Mobile-First** - Built for Kenyan mobile money users
- **🔄 Real-time Tracking** - Monitor payment status in real-time
- **🐳 Docker Support** - Easy deployment with containers

## Tech Stack

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (via Mongoose)
- **Blockchain**: Stellar SDK
- **Payment**: M-Pesa SDK (Daraja API)
- **Testing**: Jest
- **Logging**: Winston

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **HTTP Client**: Axios

### Infrastructure

- **Container**: Docker & Docker Compose
- **CI/CD**: GitHub Actions

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Docker and Docker Compose (optional)
- MongoDB (local or Atlas)
- Stellar account (for payment processing)
- M-Pesa Developer Account (Daraja API)

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/pilb.git
   cd pilb
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   ```

4. **Configure environment variables**

   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration

   # Frontend
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your configuration
   ```

5. **Start the development servers**

   Backend:

   ```bash
   cd backend
   npm run dev
   ```

   Frontend:

   ```bash
   cd frontend
   npm run dev
   ```

6. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Environment Variables

### Backend (.env)

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/pilb

# Stellar
STELLAR_NETWORK=testnet
STELLAR_SECRET_KEY=your_secret_key
STELLAR_PUBLIC_KEY=your_public_key

# M-Pesa
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_INITIATOR_NAME=your_initiator_name
MPESA_INITIATOR_PASSWORD=your_initiator_password
MPESA_ENV=sandbox

# Encryption
ENCRYPTION_KEY=your_32_character_encryption_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
VITE_STELLAR_NETWORK=testnet
```

## Docker Setup

### Using Docker Compose

1. **Configure environment**

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. **Build and run**

   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000

### Manual Docker Build

**Backend:**

```bash
cd backend
docker build -t pilb-backend .
docker run -p 3000:3000 --env-file .env pilb-backend
```

**Frontend:**

```bash
cd frontend
docker build -t pilb-frontend .
docker run -p 80:80 pilb-frontend
```

## API Endpoints

### Authentication

| Method | Endpoint           | Description                      |
| ------ | ------------------ | -------------------------------- |
| POST   | `/api/auth/login`  | Authenticate with Stellar wallet |
| GET    | `/api/auth/verify` | Verify authentication token      |

### Payments

| Method | Endpoint                 | Description            |
| ------ | ------------------------ | ---------------------- |
| POST   | `/api/payments/initiate` | Initiate a new payment |
| GET    | `/api/payments/:id`      | Get payment status     |
| GET    | `/api/payments`          | List all payments      |

### Verification

| Method | Endpoint                   | Description              |
| ------ | -------------------------- | ------------------------ |
| POST   | `/api/verification/verify` | Verify payment with code |
| POST   | `/api/verification/resend` | Resend verification code |

### Health

| Method | Endpoint      | Description           |
| ------ | ------------- | --------------------- |
| GET    | `/api/health` | Health check endpoint |

For detailed API documentation, see [API.md](./docs/API.md).

## Security

- **AES-256 Encryption**: All sensitive data is encrypted
- **Stellar Blockchain**: Immutable transaction record
- **No Sender Data on M-Pesa**: Recipient sees only the code
- **Separate Code Channel**: Verification code shared via different channel
- **HTTPS Only**: All production traffic is encrypted
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Sanitized inputs to prevent injection

## Architecture

PILB follows a clean architecture pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  Home   │  │  Send   │  │ Verify  │  │Dashboard│        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       └────────────┴────────────┴────────────┘              │
│                          │                                   │
│                    ┌─────▼─────┐                             │
│                    │  API Client │                           │
│                    └─────┬─────┘                             │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                    Backend (Express)                         │
│                    ┌─────▼─────┐                             │
│                    │ Controllers │                           │
│                    └─────┬─────┘                             │
│       ┌──────────────────┼──────────────────┐               │
│  ┌────▼────┐       ┌─────▼─────┐      ┌─────▼────┐         │
│  │ Routes  │       │ Services  │      │  Models  │         │
│  └─────────┘       └─────┬─────┘      └──────────┘         │
│              ┌───────────┼───────────┐                      │
│         ┌────▼────┐ ┌────▼────┐ ┌────▼────┐                │
│         │ Stellar │ │  M-Pesa │ │Encryption│                │
│         │ Service │ │ Service │ │ Service │                │
│         └─────────┘ └─────────┘ └─────────┘                │
└─────────────────────────────────────────────────────────────┘
```

For detailed architecture documentation, see [ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](./docs/CONTRIBUTING.md) before submitting a pull request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Roadmap

- [ ] Add support for more mobile money providers
- [ ] Implement mobile app (React Native)
- [ ] Add multi-currency support
- [ ] Implement batch payments
- [ ] Add transaction history export
- [ ] Implement webhooks for third-party integrations

## Support

- 📖 Documentation: [docs/](docs/)
  - [Documentation Index](./docs/INDEX.md)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/pilb/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/pilb/discussions)

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

Made for Kenya's financial inclusion

[![Stellar](https://img.shields.io/badge/Powered_by-Stellar-blue)](https://stellar.org)
