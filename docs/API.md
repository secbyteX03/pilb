# PILB API Reference

## Authentication Endpoints

### GET /api/auth/challenge

Generate a SEP-10 challenge transaction for authentication.

**Parameters:**

- `publicKey` (query): User's Stellar public key

**Response:**

```json
{
  "transaction": "base64_encoded_transaction",
  "networkPassphrase": "Test SDF Network ; September 2015",
  "expiresAt": "2024-01-15T12:00:00.000Z"
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

### GET /api/payments/:id

Get payment status.

**Response:**

```json
{
  "id": "uuid",
  "amount_KES": 500,
  "status": "completed",
  "created_at": "2024-01-15T...",
  "stellar_tx_hash": "...",
  "mpesa_tx_id": "..."
}
```

### GET /api/payments/history

Get payment history for a public key.

**Query:**

- `publicKey`: Stellar public key
- `limit`: Number of results (default 20)
- `offset`: Pagination offset

**Response:**

```json
{
  "payments": [
    {
      "id": "uuid",
      "amount_KES": 500,
      "recipient_phone": "XXXX5678",
      "status": "completed",
      "created_at": "2024-01-15T..."
    }
  ],
  "total": 10,
  "limit": 20,
  "offset": 0
}
```

## Verification Endpoints

### GET /api/verify/payment

Verify a payment by code.

**Query:** `code` - Verification code

**Response:**

```json
{
  "verified": true,
  "amount": "500",
  "timestamp": "2024-01-15T...",
  "transactionHash": "stellar_tx_hash"
}
```

### GET /api/verify/transaction

Verify by Stellar transaction hash.

**Query:** `txHash` - Stellar transaction hash

**Response:**

```json
{
  "verified": true,
  "amount": "500",
  "timestamp": "2024-01-15T..."
}
```

## Health Check

### GET /api/health

Check API health status.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "service": "PILB Backend"
}
```
