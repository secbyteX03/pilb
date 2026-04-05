# PILB - Private Instant Ledger Bridge

**Anonymous M-Pesa Payments via Stellar**

Send and Receive Money Privately, Keep Your Identity

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stellar](https://img.shields.io/badge/Stellar-Network-blue.svg)](https://stellar.org)
[![M-Pesa](https://img.shields.io/badge/M--Pesa-Integration-green.svg)](https://safaricom.co.ke)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)

## Table of Contents

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
- [Frontend Pages](#frontend-pages)
- [Security](#security)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [License](#license)

## About

PILB (Private Instant Ledger Bridge) is a revolutionary payment system that enables anonymous M-Pesa transfers using the Stellar blockchain. By leveraging cryptographic techniques and the Stellar network, PILB allows users to send and receive money to anyone in Kenya via M-Pesa without revealing their identity.

## Problem Statement

In Kenya, financial privacy is a significant concern when using mobile money services. When sending money through M-Pesa, the sender's full phone number and name are always visible to the recipient. This lack of privacy creates challenges for:

- **Journalists and activists** who need to protect their sources and contacts
- **Business owners** who want to keep supplier relationships confidential
- **Individuals** who value their financial privacy
- **Charitable organizations** that need to protect beneficiary information
- **Remote workers and freelancers** receiving international payments

Similarly, when receiving money, your phone number becomes visible to the sender, which may not be desirable in many situations.

### The M-Pesa Privacy Challenge

With M-Pesa's recent update showing only partial numbers and requiring sender approval for full number display, privacy has improved. However, the sender's name still appears, and both parties must approve for full number visibility. PILB takes this further by completely removing any connection between the Stellar blockchain transactions and M-Pesa phone numbers.

### The Verification Problem

Additionally, verifying payments received via M-Pesa can be difficult - recipients must forward SMS notifications to 334 to verify sender details, which is time-consuming and not always reliable.

## How It Works

PILB uses a clever two-step verification system to maintain anonymity:

### Sending Money

1. **Payment Initiation**

   - User enters the amount and recipient's phone number
   - App generates a unique 8-character verification code
   - The code is hashed using AES-256 encryption
   - Payment is sent to Stellar with the hash in the transaction memo

2. **Verification & Payout**
   - Backend watches the Stellar network for incoming payments
   - Once payment is confirmed, the system triggers M-Pesa B2C
   - Recipient receives the money via M-Pesa with no sender information
   - The 8-character code is shared separately (via SMS, WhatsApp, etc.)

### Receiving Money (Payment Links)

1. **Create Payment Link**

   - User creates a payment link with desired amount and description
   - Gets a unique shareable link

2. **Share & Receive**
   - Share the link with anyone (locally or internationally)
   - Payer sends crypto (XLM/USDC) through the link
   - Funds are automatically converted and sent to user's M-Pesa

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

- 🔒 **Complete Anonymity** - Sender details never reach the recipient. Both sender and receiver remain anonymous through Stellar blockchain.
- ⚡ **Fast Transactions** - Stellar confirms in 3-5 seconds, M-Pesa delivers within seconds
- 💰 **Low Fees** - Stellar transactions cost a fraction of a cent
- 🌍 **Global Reach** - Send and receive from anywhere in the world to Kenya via M-Pesa
- 🔐 **Bank-Grade Security** - AES-256 encryption, Stellar's immutable ledger
- 📱 **Mobile-First** - Built for Kenyan mobile money users
- 🔄 **Real-time Tracking** - Monitor payment status in real-time on your dashboard
- 🐳 **Docker Support** - Easy deployment with containers
- 🌐 **Cross-Border Payments** - Send to Uganda, Tanzania, Nigeria, Ghana, South Africa, and more while remaining anonymous
- 📊 **Payment Links** - Generate shareable payment links to receive payments. The sender can also remain anonymous - they send crypto and you get M-Pesa
- 📅 **Scheduled Payments** - Set up recurring or future payments. Schedule a payment to be carried out instantly whenever money hits your account
- 📄 **Invoice Management** - Create and manage invoices for payments
- 🔒 **Escrow System** - Secure transactions with escrow support - funds are held until conditions are met
- 💸 **Receive Payments** - Get paid anonymously by sharing payment links. No need to reveal your phone number
- 💱 **Multi-Currency** - Support for XLM, USDC, and other Stellar tokens. Recipients receive in KES via M-Pesa
- ✅ **Verify Payments** - Easily verify incoming payments using unique verification codes

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
- **Styling**: Tailwind CSS with custom black/white/gold theme
- **State Management**: React Context + Zustand
- **HTTP Client**: Axios
- **Fonts**: Sora (Google Fonts)

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
   git clone https://github.com/secbyteX03/pilb.git
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
MONGODB_URI=mongodb://localhost:27017/stellarpay

# Stellar
STELLAR_NETWORK=testnet
STELLAR_SECRET_KEY=your_secret_key
STELLAR_PUBLIC_KEY=your_public_key
STELLAR_SERVER_URL=https://horizon-testnet.stellar.org

# M-Pesa
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_INITIATOR_NAME=your_initiator_name
MPESA_INITIATOR_PASSWORD=your_initiator_password
MPESA_PASSKEY=your_passkey
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
docker build -t stellarpay-backend .
docker run -p 3000:3000 --env-file .env stellarpay-backend
```

**Frontend:**

```bash
cd frontend
docker build -t stellarpay-frontend .
docker run -p 80:80 stellarpay-frontend
```

## API Endpoints

### Authentication

| Method | Endpoint                 | Description                 |
| ------ | ------------------------ | --------------------------- |
| GET    | `/api/auth/challenge`    | Generate SEP-10 challenge   |
| POST   | `/api/auth/authenticate` | Authenticate with wallet    |
| GET    | `/api/auth/verify`       | Verify authentication token |

### Payments

| Method | Endpoint                              | Description                 |
| ------ | ------------------------------------- | --------------------------- |
| POST   | `/api/payments/initiate`              | Initiate a new payment      |
| POST   | `/api/payments/initiate-cross-border` | Cross-border payment        |
| POST   | `/api/payments/link`                  | Create payment link         |
| GET    | `/api/payments/link/:id`              | Get payment link            |
| POST   | `/api/payments/scheduled`             | Create scheduled payment    |
| GET    | `/api/payments/scheduled/:id`         | Get scheduled payment       |
| POST   | `/api/payments/confirm`               | Confirm Stellar transaction |
| GET    | `/api/payments/currencies`            | Get supported currencies    |
| GET    | `/api/payments/history`               | Get payment history         |
| GET    | `/api/payments/:id`                   | Get payment status          |

### Verification

| Method | Endpoint                         | Description                |
| ------ | -------------------------------- | -------------------------- |
| GET    | `/api/verification/:id`          | Get verification status    |
| POST   | `/api/verification/:id/verify`   | Verify payment             |
| POST   | `/api/verification/scan`         | Scan QR code               |
| POST   | `/api/verification/link`         | Generate payment link      |
| POST   | `/api/verification/in-store`     | Create in-store QR         |
| GET    | `/api/verification/merchant/all` | Get merchant verifications |

### Invoices

| Method | Endpoint                 | Description    |
| ------ | ------------------------ | -------------- |
| POST   | `/api/invoices`          | Create invoice |
| GET    | `/api/invoices`          | List invoices  |
| GET    | `/api/invoices/:id`      | Get invoice    |
| PUT    | `/api/invoices/:id`      | Update invoice |
| DELETE | `/api/invoices/:id`      | Delete invoice |
| POST   | `/api/invoices/:id/send` | Send invoice   |

### Escrow

| Method | Endpoint                  | Description        |
| ------ | ------------------------- | ------------------ |
| POST   | `/api/escrow`             | Create escrow      |
| GET    | `/api/escrow/:id`         | Get escrow details |
| POST   | `/api/escrow/:id/fund`    | Fund escrow        |
| POST   | `/api/escrow/:id/release` | Release escrow     |
| POST   | `/api/escrow/:id/cancel`  | Cancel escrow      |

### Stellar

| Method | Endpoint                            | Description        |
| ------ | ----------------------------------- | ------------------ |
| GET    | `/api/stellar/account/:publicKey`   | Get account info   |
| POST   | `/api/stellar/transactions`         | Submit transaction |
| GET    | `/api/stellar/transactions/:txHash` | Get transaction    |

### Health

| Method | Endpoint      | Description           |
| ------ | ------------- | --------------------- |
| GET    | `/api/health` | Health check endpoint |

For detailed API documentation, see [API.md](./docs/API.md).

## Frontend Pages

PILB provides the following pages:

1. **Home** (`/`) - Landing page with features, pricing, and CTA
2. **Send** (`/send`) - Send money to recipients (local and cross-border)
3. **Request Payment** (`/links`) - Create and manage payment links to receive payments
4. **Verify** (`/verify`) - Verify incoming payments
5. **Dashboard** (`/dashboard`) - View transaction history and stats
6. **Scheduled Payments** (`/scheduled`) - View and manage scheduled payments
7. **Pay** (`/pay`) - Pay using a payment link
8. **Docs** (`/docs`) - API documentation for developers
9. **Login** (`/login`) - Connect Stellar wallet

### Design Theme

PILB features a sophisticated black, white, and gold theme:

- **Primary Background**: #0D0D0D (rich black)
- **Accent Color**: #D4AF37 (gold)
- **Text Colors**: White (#FFFFFF) and gray variants
- **Font**: Sora (Google Fonts)

## Security

- **AES-256 Encryption**: All sensitive data is encrypted
- **Stellar Blockchain**: Immutable transaction record
- **No Sender Data on M-Pesa**: Recipient sees only the code
- **Separate Code Channel**: Verification code shared via different channel
- **HTTPS Only**: All production traffic is encrypted
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Sanitized inputs to prevent injection
- **Helmet.js**: Security headers for all HTTP responses
- **CORS**: Configured to allow only trusted origins

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
│  │ Routes  │       │ Services  │      │  Models  │           │
│  └─────────┘       └─────┬─────┘      └──────────┘         │
│              ┌───────────┼───────────┐                      │
│         ┌────▼────┐ ┌────▼────┐ ┌────▼────┐                │
│         │ Stellar │ │  M-Pesa │ │Encryption│                 │
│         │ Service │ │ Service │ │ Service │                 │
│         └─────────┘ └─────────┘ └─────────┘                 │
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
- [ ] Add more payment methods (cards, crypto)

## Support

- 📖 Documentation: [docs/](docs/)
  - [Documentation Index](./docs/INDEX.md)
- 🐛 Issues: [GitHub Issues](https://github.com/secbyteX03/pilb/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/secbyteX03/pilb/discussions)

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

Made for Kenya's financial inclusion

[![Stellar](https://img.shields.io/badge/Powered_by-Stellar-blue)](https://stellar.org)
