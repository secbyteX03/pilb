# StellarPay API Reference

This document provides a comprehensive reference for all StellarPay API endpoints.

## Base URL

```
Development: http://localhost:3000
Production: https://api.stellarpay.io
```

## Authentication

StellarPay uses SEP-10 (Stellar Ecosystem Proposal 10) for authentication with Stellar wallets.

### GET /api/auth/challenge

Generate a SEP-10 challenge transaction for authentication.

**Parameters:**

- `publicKey` (query): User's Stellar public key

**Response:**

```json
{
  "transaction": "base64_encoded_transaction",
  "networkPassphrase": "Test SDF Network ; September 2015",
  "expiresAt": "2026-04-04T12:00:00.000Z"
}
```

### POST /api/auth/authenticate

Authenticate with signed challenge.

**Body:**

```json
{
  "publicKey": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "signedTransaction": "base64_encoded_signed_transaction"
}
```

**Response:**

```json
{
  "token": "Bearer eyJ...",
  "publicKey": "GXXXXXXXXXXXXXXXX..."
}
```

### GET /api/auth/verify

Verify authentication token.

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "publicKey": "GXXXXXXXXXXXXXXXX..."
}
```

---

## Payment Endpoints

### POST /api/payments/initiate

Create a new payment and get verification code.

**Body:**

```json
{
  "amount": 500,
  "recipientPhone": "0712345678",
  "senderPublicKey": "GXXXXXXXXXXXXXXXX..."
}
```

**Response:**

```json
{
  "paymentId": "uuid",
  "verificationCode": "X9K2L1Q",
  "amount": 500,
  "amountXLM": "20.0000000",
  "recipientPhone": "254712345678",
  "stellarTransaction": {
    "destination": "GXXXXXXXXXXXXXXXX...",
    "amount": "20.0000000",
    "memo": "code_hash_here"
  }
}
```

### POST /api/payments/initiate-cross-border

Create a cross-border payment to supported countries.

**Supported Countries:**

- Kenya (KE) - 2.5% fee
- Uganda (UG) - 3.0% fee + 100 KES
- Tanzania (TZ) - 3.0% fee + 150 KES
- Nigeria (NG) - 4.5% fee + 500 KES
- Ghana (GH) - 4.0% fee + 400 KES
- South Africa (ZA) - 5.0% fee + 600 KES
- India (IN) - 5.5% fee + 800 KES
- United States (US) - 6.0% fee + 1000 KES
- United Kingdom (GB) - 5.5% fee + 900 KES
- European Union (EU) - 5.5% fee + 900 KES

**Body:**

```json
{
  "amount": 1000,
  "recipientPhone": "+256712345678",
  "senderPublicKey": "GXXXXXXXXXXXXXXXX...",
  "currency": "KES",
  "recipientCountry": "UG"
}
```

**Response:**

```json
{
  "paymentId": "uuid",
  "verificationCode": "AB12CD34",
  "amount": 1000,
  "amountXLM": "40.0000000",
  "currency": "KES",
  "recipientCountry": "UG",
  "fee": 30,
  "totalAmount": 1030,
  "recipientPhone": "256712345678"
}
```

### POST /api/payments/link

Create a payment link for easy sharing.

**Body:**

```json
{
  "amount": 500,
  "currency": "KES",
  "description": "Payment for services",
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel"
}
```

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "linkId": "pl_...",
  "url": "http://localhost:3000/pay/pl_...",
  "qrCode": "data:image/png;base64,..."
}
```

### GET /api/payments/link/:id

Get payment link details.

**Response:**

```json
{
  "linkId": "pl_...",
  "amount": 500,
  "currency": "KES",
  "description": "Payment for services",
  "status": "active",
  "createdAt": "2026-04-04T00:00:00.000Z"
}
```

### POST /api/payments/scheduled

Create a scheduled payment.

**Body:**

```json
{
  "amount": 5000,
  "recipientPhone": "0712345678",
  "currency": "KES",
  "scheduledDate": "2026-04-15T10:00:00.000Z",
  "recurring": false,
  "description": "Monthly rent"
}
```

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "scheduledPaymentId": "sp_...",
  "amount": 5000,
  "recipientPhone": "254712345678",
  "scheduledDate": "2026-04-15T10:00:00.000Z",
  "status": "pending"
}
```

### GET /api/payments/scheduled

Get all scheduled payments for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "scheduledPayments": [
    {
      "id": "sp_...",
      "amount": 5000,
      "recipientPhone": "254712345678",
      "scheduledDate": "2026-04-15T10:00:00.000Z",
      "status": "pending"
    }
  ]
}
```

### POST /api/payments/confirm

Confirm Stellar transaction was sent.

**Headers:** `Authorization: Bearer <token>`

**Body:**

```json
{
  "paymentId": "uuid",
  "stellarTxHash": "hash_from_stellar"
}
```

**Response:**

```json
{
  "success": true,
  "status": "on_stellar",
  "stellarTxHash": "..."
}
```

### GET /api/payments/currencies

Get supported currencies.

**Response:**

```json
{
  "currencies": [
    { "code": "KES", "name": "Kenyan Shilling", "symbol": "KSh" },
    { "code": "USD", "name": "US Dollar", "symbol": "$" },
    { "code": "EUR", "name": "Euro", "symbol": "€" },
    { "code": "GBP", "name": "British Pound", "symbol": "£" }
  ]
}
```

### GET /api/payments/exchange-rate

Get exchange rate between currencies.

**Query:**

- `from`: Source currency (e.g., "USD")
- `to`: Target currency (e.g., "KES")

**Response:**

```json
{
  "from": "USD",
  "to": "KES",
  "rate": 157.5,
  "timestamp": "2026-04-04T00:00:00.000Z"
}
```

### GET /api/payments/history

Get payment history for a user.

**Headers:** `Authorization: Bearer <token>`

**Query:**

- `limit`: Number of results (default 20)
- `offset`: Pagination offset
- `status`: Filter by status (optional)

**Response:**

```json
{
  "payments": [
    {
      "id": "uuid",
      "amount_KES": 500,
      "recipient_phone": "XXXX5678",
      "status": "completed",
      "created_at": "2026-04-04T00:00:00.000Z"
    }
  ],
  "total": 10,
  "limit": 20,
  "offset": 0
}
```

### GET /api/payments/:id

Get payment status by ID.

**Response:**

```json
{
  "id": "uuid",
  "amount_KES": 500,
  "status": "completed",
  "created_at": "2026-04-04T00:00:00.000Z",
  "stellar_tx_hash": "...",
  "mpesa_tx_id": "..."
}
```

---

## Verification Endpoints

### GET /api/verification/:id

Get verification status by ID.

**Response:**

```json
{
  "verificationId": "uuid",
  "status": "verified",
  "amount": 500,
  "currency": "KES",
  "verifiedAt": "2026-04-04T00:00:00.000Z"
}
```

### POST /api/verification/:id/verify

Verify a payment by ID.

**Body:**

```json
{
  "customerInfo": {
    "name": "John Doe",
    "phone": "0712345678"
  }
}
```

**Response:**

```json
{
  "success": true,
  "verification": {
    "verificationId": "uuid",
    "status": "verified",
    "amount": 500
  }
}
```

### POST /api/verification/scan

Scan and process QR code.

**Body:**

```json
{
  "qrData": "json_string_from_qr_code",
  "customerInfo": {
    "name": "John Doe",
    "phone": "0712345678"
  }
}
```

**Response:**

```json
{
  "success": true,
  "verification": {...}
}
```

### POST /api/verification/link

Generate a payment link (authenticated).

**Headers:** `Authorization: Bearer <token>`

**Body:**

```json
{
  "amount": 500,
  "currency": "KES",
  "description": "Payment",
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel"
}
```

### POST /api/verification/in-store

Create an in-store QR code for payments.

**Headers:** `Authorization: Bearer <token>`

**Body:**

```json
{
  "terminalId": "POS-001",
  "amount": 500,
  "currency": "KES"
}
```

**Response:**

```json
{
  "qrCode": "data:image/png;base64,...",
  "expiresAt": "2026-04-04T00:05:00.000Z"
}
```

### GET /api/verification/merchant/all

Get all verifications for the merchant.

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "verifications": [
    {
      "verificationId": "uuid",
      "amount": 500,
      "status": "verified",
      "created_at": "2026-04-04T00:00:00.000Z"
    }
  ]
}
```

---

## Invoice Endpoints

### POST /api/invoices

Create a new invoice.

**Headers:** `Authorization: Bearer <token>`

**Body:**

```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "0712345678",
  "items": [
    {
      "description": "Service A",
      "quantity": 1,
      "unitPrice": 500,
      "total": 500
    }
  ],
  "subtotal": 500,
  "tax": 50,
  "total": 550,
  "dueDate": "2026-04-30T00:00:00.000Z",
  "status": "pending"
}
```

### GET /api/invoices

List all invoices for the merchant.

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "invoices": [
    {
      "id": "uuid",
      "invoiceNumber": "INV-001",
      "customerName": "John Doe",
      "total": 550,
      "status": "pending",
      "created_at": "2026-04-04T00:00:00.000Z"
    }
  ]
}
```

### GET /api/invoices/:id

Get invoice details.

**Response:**

```json
{
  "id": "uuid",
  "invoiceNumber": "INV-001",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "items": [...],
  "subtotal": 500,
  "tax": 50,
  "total": 550,
  "status": "pending",
  "dueDate": "2026-04-30T00:00:00.000Z"
}
```

### PUT /api/invoices/:id

Update an invoice.

### DELETE /api/invoices/:id

Delete an invoice.

### POST /api/invoices/:id/send

Send invoice to customer.

**Body:**

```json
{
  "sendEmail": true,
  "sendSMS": false
}
```

---

## Escrow Endpoints

### POST /api/escrow

Create an escrow transaction.

**Headers:** `Authorization: Bearer <token>`

**Body:**

```json
{
  "amount": 1000,
  "currency": "KES",
  "buyerPublicKey": "GXXXXXXXXXXXXXXXX...",
  "sellerPublicKey": "GXXXXXXXXXXXXXXXX...",
  "description": "Payment for goods",
  "releaseCondition": "Goods received"
}
```

**Response:**

```json
{
  "escrowId": "escrow_...",
  "status": "pending",
  "amount": 1000
}
```

### GET /api/escrow/:id

Get escrow details.

**Response:**

```json
{
  "escrowId": "escrow_...",
  "amount": 1000,
  "status": "funded",
  "buyer": "GXXXXXXXXXXXXXXXX...",
  "seller": "GXXXXXXXXXXXXXXXX...",
  "created_at": "2026-04-04T00:00:00.000Z"
}
```

### POST /api/escrow/:id/fund

Fund an escrow account.

**Body:**

```json
{
  "funderPublicKey": "GXXXXXXXXXXXXXXXX..."
}
```

### POST /api/escrow/:id/release

Release funds from escrow to seller.

### POST /api/escrow/:id/cancel

Cancel escrow and refund buyer.

---

## Stellar Endpoints

### GET /api/stellar/account/:publicKey

Get Stellar account information.

**Response:**

```json
{
  "publicKey": "GXXXXXXXXXXXXXXXX...",
  "sequence": "123456789",
  "balance": "100.0000000",
  "flags": {
    "authRequired": false,
    "authRevocable": false
  }
}
```

### POST /api/stellar/transactions

Submit a Stellar transaction.

**Body:**

```json
{
  "sourcePublicKey": "GXXXXXXXXXXXXXXXX...",
  "destination": "GXXXXXXXXXXXXXXXX...",
  "amount": "10.0000000",
  "memo": "optional_memo"
}
```

**Response:**

```json
{
  "success": true,
  "transactionHash": "hash_from_stellar"
}
```

### GET /api/stellar/transactions/:txHash

Get transaction details by hash.

---

## Health Check

### GET /api/health

Check API health status.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-04-04T00:00:00.000Z",
  "service": "StellarPay Backend"
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

**Related Documentation:**

- [Architecture Overview](./ARCHITECTURE.md) - System design
- [Deployment Guide](./DEPLOYMENT.md) - Setup instructions
