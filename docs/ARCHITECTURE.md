# StellarPay Architecture

## System Overview

StellarPay enables anonymous M-Pesa payments through the Stellar blockchain. The system maintains sender privacy while providing verifiable transactions.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                              │
│   React App - Send money, verify payments, view history       │
│   Pages: Home, Send, Verify, Dashboard, Payment Links,         │
│          Scheduled Payments, Docs, Login                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Auth      │  │  Payments   │  │  Verify     │          │
│  │   (SEP-10)  │  │   API       │  │   API       │          │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
│         │                │                │                  │
│  ┌──────┴────────────────┴────────────────┴──────┐           │
│  │              Payment Processor               │           │
│  │   - Watches Stellar for incoming payments    │           │
│  │   - Triggers M-Pesa disbursements             │           │
│  │   - Updates payment status                   │           │
│  └──────────────────────┬───────────────────────┘           │
│         ┌────────────────┴────────────────┐                  │
│  ┌──────▼──────┐  ┌──────────▼──────────┐  ┌────────┐       │
│  │   Invoices  │  │      Escrow        │  │ Stellar│       │
│  │    API      │  │       API          │  │  API   │       │
│  └─────────────┘  └─────────────────────┘  └────────┘       │
└─────────────────────────┼───────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
         ▼                ▼                ▼
┌─────────────────┐ ┌───────────┐ ┌─────────────┐
│   STELLAR       │ │  M-PESA   │ │   MONGODB   │
│   NETWORK       │ │  (Daraja) │ │  Database   │
│   (Testnet)     │ │           │ │             │
└─────────────────┘ └───────────┘ └─────────────┘
```

## Core Components

### 1. Frontend (React + TypeScript + Vite)

**Pages:**

- **Home** (`/`) - Landing page with features, pricing, and CTA
- **Send** (`/send`) - Send money locally and cross-border
- **Verify** (`/verify`) - Verify incoming payments
- **Dashboard** (`/dashboard`) - Transaction history and statistics
- **Payment Links** (`/payment-links`) - Create and manage payment links
- **Scheduled Payments** (`/scheduled`) - Manage scheduled recurring payments
- **Docs** (`/docs`) - API documentation for developers
- **Login** (`/login`) - Connect Stellar wallet (SEP-10)

**State Management:**

- Zustand for auth state
- React Context for global state

**Styling:**

- Tailwind CSS
- Custom black/white/gold theme
- Sora font (Google Fonts)

**Key Features:**

- Country code auto-detection
- Real-time transaction cost calculation
- Cross-border payment support
- QR code generation for payment links

### 2. Backend (Node.js + Express + TypeScript)

**API Endpoints:**

- **Auth**: SEP-10 Stellar authentication
- **Payments**: Initiate, confirm, history, currencies, exchange rates
- **Verification**: QR codes, payment links, in-store payments
- **Invoices**: Create, list, update, delete, send
- **Escrow**: Create, fund, release, cancel
- **Stellar**: Account info, transactions

**Key Services:**

- Payment Service - Payment processing
- Encryption Service - AES-256 encryption
- M-Pesa Service - Daraja API integration
- Stellar Service - Blockchain operations
- Exchange Rate Service - Currency conversion

### 3. Payment Flow

```
1. User enters amount + recipient phone
2. Backend generates verification code + hash
3. User signs Stellar transaction with code hash as memo
4. Backend watches Stellar for payment confirmation
5. Once confirmed, triggers M-Pesa B2C to recipient
6. Recipient gets funds without seeing sender details
```

### 4. Cross-Border Payments

Supported countries with fees:

- Kenya (KE) - 2.5% fee
- Uganda (UG) - 3.0% + 100 KES
- Tanzania (TZ) - 3.0% + 150 KES
- Nigeria (NG) - 4.5% + 500 KES
- Ghana (GH) - 4.0% + 400 KES
- South Africa (ZA) - 5.0% + 600 KES
- India (IN) - 5.5% + 800 KES
- United States (US) - 6.0% + 1000 KES
- United Kingdom (GB) - 5.5% + 900 KES
- European Union (EU) - 5.5% + 900 KES

## Security Features

### Privacy

- Verification code shared separately (SMS/WhatsApp)
- Only code hash on Stellar blockchain
- Sender details encrypted in database
- No sender information in M-Pesa B2C

### Verification

- Payment can be verified by code
- Transaction hash provides proof on blockchain
- No identity needed to verify

### Authentication

- SEP-10 wallet authentication
- JWT tokens for session management
- CORS configured for trusted origins

### Network Security

- Helmet.js for security headers
- Rate limiting on API endpoints
- Input validation and sanitization

## Data Models

### Payment Record

```typescript
interface Payment {
  id: string;
  amount_KES: number;
  amount_XLM: string;
  recipient_phone: string; // encrypted
  sender_public_key: string;
  verification_code: string;
  code_hash: string;
  stellar_tx_hash: string;
  mpesa_tx_id: string;
  status: "pending" | "on_stellar" | "mpesa_sent" | "completed" | "failed";
  created_at: Date;
  updated_at: Date;
}
```

### Invoice Record

```typescript
interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  dueDate: Date;
  created_at: Date;
}
```

### Escrow Record

```typescript
interface Escrow {
  id: string;
  amount: number;
  currency: string;
  buyerPublicKey: string;
  sellerPublicKey: string;
  description: string;
  releaseCondition: string;
  status: "pending" | "funded" | "released" | "cancelled";
  created_at: Date;
}
```

## Environment Variables

### Backend

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/stellarpay
STELLAR_NETWORK=testnet
STELLAR_SECRET_KEY=your_secret_key
STELLAR_PUBLIC_KEY=your_public_key
STELLAR_SERVER_URL=https://horizon-testnet.stellar.org
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_INITIATOR_NAME=your_initiator_name
MPESA_INITIATOR_PASSWORD=your_initiator_password
MPESA_PASSKEY=your_passkey
MPESA_ENV=sandbox
ENCRYPTION_KEY=your_32_character_encryption_key
FRONTEND_URL=http://localhost:5173
```

### Frontend

```env
VITE_API_URL=http://localhost:3000
VITE_STELLAR_NETWORK=testnet
```

## Deployment Options

### Development

- Local Node.js servers
- Docker Compose for services

### Production

- Docker containers
- Cloud hosting (Heroku, AWS, DigitalOcean)
- MongoDB Atlas for database

## Project Structure

```
stellarpilb/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # HTTP controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/      # Business logic
│   │   │   ├── auth/       # SEP-10 authentication
│   │   │   ├── encryption/# AES encryption
│   │   │   ├── escrow/    # Escrow service
│   │   │   ├── exchange/   # Exchange rates
│   │   │   ├── invoicing/  # Invoice service
│   │   │   ├── mpesa/     # M-Pesa integration
│   │   │   ├── paymentGateway/ # Payment processing
│   │   │   ├── stellar/   # Stellar blockchain
│   │   │   └── verification/ # Verification service
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utilities
│   └── tests/             # Unit tests
├── frontend/
│   ├── src/
│   │   ├── api/           # API clients
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # Services
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utilities
│   └── public/            # Static assets
└── docs/                  # Documentation
```

---

**Next Steps:**

- [API Reference](./API.md) - Explore the API endpoints
- [Deployment Guide](./DEPLOYMENT.md) - Set up your environment
- [Contributing](./CONTRIBUTING.md) - Join the development
