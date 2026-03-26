# PILB Architecture

## System Overview

PILB enables anonymous M-Pesa payments through Stellar blockchain. The system maintains sender privacy while providing verifiable transactions.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                              │
│   React App - Send money, verify payments, view history       │
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
└─────────────────────────┼───────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
         ▼                ▼                ▼
┌─────────────────┐ ┌───────────┐ ┌─────────────┐
│   STELLAR       │ │  M-PESA   │ │  POSTGRES   │
│   NETWORK       │ │  (Daraja) │ │  Database   │
│   (Testnet)     │ │           │ │             │
└─────────────────┘ └───────────┘ └─────────────┘
```

## Core Components

### 1. Frontend (React + TypeScript)

- **Pages**: Home, Send, Verify, Dashboard
- **State**: Zustand for auth state, React Query for API
- **Styling**: Tailwind CSS

### 2. Backend (Node.js + Express)

- **API**: RESTful endpoints for auth, payments, verification
- **Auth**: SEP-10 Stellar authentication
- **Processing**: Real-time Stellar payment watcher

### 3. Payment Flow

```
1. User enters amount + recipient phone
2. Backend generates verification code + hash
3. User signs Stellar transaction with code hash as memo
4. Backend watches Stellar for payment confirmation
5. Once confirmed, triggers M-Pesa B2C to recipient
6. Recipient gets funds without seeing sender details
```

## Security Features

### Privacy

- Verification code shared separately (SMS/WhatsApp)
- Only code hash on Stellar blockchain
- Sender details encrypted in database

### Verification

- Payment can be verified by code
- Transaction hash provides proof on blockchain
- No identity needed to verify

## Data Models

### Payment Record

- `id`: UUID
- `amount_KES`: Payment amount in KES
- `amount_XLM`: Equivalent in XLM
- `recipient_phone`: M-Pesa number (encrypted)
- `sender_public_key`: Stellar address
- `verification_code`: Human-readable code
- `code_hash`: SHA-256 hash for blockchain
- `stellar_tx_hash`: Transaction proof
- `mpesa_tx_id`: M-Pesa confirmation
- `status`: pending → on_stellar → mpesa_sent → completed

## Environment Variables

### Backend

- `STELLAR_NETWORK`: testnet/mainnet
- `SERVICE_WALLET_ADDRESS`: Your Stellar public key
- `MPESA_CONSUMER_KEY`: Safaricom API key
- `DATABASE_URL`: PostgreSQL connection

### Frontend

- `VITE_API_URL`: Backend API URL
- `VITE_STELLAR_NETWORK`: Network selection

## Deployment Options

### Development

- Local Node.js servers
- Docker Compose for services

### Production

- Docker containers
- Cloud hosting (Heroku, AWS)
- PostgreSQL managed database
