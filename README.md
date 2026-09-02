# Luxury Products

A Node.js and Express REST API that records luxury-product ownership transfers on a local Proof-of-Work blockchain. Each product has a digital passport identified by a `serialNumber`, and every transfer is stored as a transaction in the chain.

## Setup

Requires Node.js.

```bash
npm install
cp .env.example .env
npm run dev
```

Run tests:

```bash
npm test
```

For production-style runs:

```bash
npm run build
npm start
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `3000`) |
| `POW_DIFFICULTY` | Number of leading zeros required in a block hash |

Use `POW_DIFFICULTY=1` during development. Higher values make mining slower.

## Storage

All data lives in memory. The chain and pending transactions are lost when the server restarts.

## Flow

A client sends a transaction with `POST /api/transactions`. The API validates it against ownership rules and adds it to the pending pool. `POST /api/mine` runs Proof-of-Work on those pending transactions and appends a new block to the chain.

## Proof-of-Work

Each block is hashed with SHA-256. The hash input is a JSON string of the block fields (`index`, `timestamp`, `data`, `previousHash`, `nonce`). Mining increments `nonce` until the hash starts with enough leading zeros, set by `POW_DIFFICULTY`. Each block stores the previous block's hash in `previousHash`, linking the chain together.

## API

### GET /api/chain

Returns the full blockchain.

**Success:** `200`

### POST /api/transactions

Adds a validated transaction to the pending pool.

**Body:**

```json
{
  "serialNumber": "ROLEX-SUB-9981",
  "fromAddress": "0xManufacturer",
  "toAddress": "0xCollectorA",
  "timestamp": 1772188800000
}
```

`fromAddress` and `toAddress` are plain strings. They are not authenticated or cryptographically verified.

**Success:** `201` — returns the stored pending transaction.

### POST /api/mine

Mines all pending transactions into a new block.

**Success:** `200` — returns the mined block.

### GET /api/verify/:id

Looks up a product by `serialNumber` (`:id`).

**Success:** `200`

```json
{
  "serialNumber": "ROLEX-SUB-9981",
  "currentOwner": "0xCollectorA",
  "history": [
    {
      "serialNumber": "ROLEX-SUB-9981",
      "fromAddress": "0xManufacturer",
      "toAddress": "0xCollectorA",
      "timestamp": 1772188800000
    }
  ],
  "pending": false
}
```

`currentOwner` is `null` if the product has not been mined yet and only exists in the pending pool.

## Error responses

Errors return JSON: `{ "error": "message" }`

| Status | When |
|--------|------|
| `400` | Bad request body, invalid JSON, or no pending transactions to mine |
| `404` | Unknown serial number or route |
| `422` | Ownership rule violation or duplicate pending transfer |
| `500` | Unexpected server error |

## Ownership rules

The first transaction for a serial number registers the product. After it has been mined, only its current owner can create the next transfer. Only one pending transaction per serial number is allowed.

## Immutability

Mined blocks are not edited. New state is recorded by adding new transactions to new blocks.
