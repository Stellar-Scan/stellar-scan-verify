# stellar-scan-verify

> Deterministic Soroban contract source verification — rebuild WASM from Rust source and confirm the hash matches what is deployed on Stellar.

[![Stellar Wave](https://img.shields.io/badge/Stellar%20Wave-Wave%205-blue?style=flat-square)](https://www.drips.network/wave/stellar)
[![Rust](https://img.shields.io/badge/Rust-1.75%2B-orange?style=flat-square)](https://www.rust-lang.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-green?style=flat-square)](.github/workflows/ci.yml)

---

## Overview

`stellar-scan-verify` enables **source verification** for deployed Soroban contracts. A developer submits their Rust source code and a target contract ID. The service:

1. Receives the Rust source (zip archive or GitHub repo URL)
2. Builds it in a reproducible Docker environment with a pinned Rust toolchain
3. Compares the resulting WASM hash against the hash stored on-chain
4. Marks the contract as **Verified** in the Stellar Scan database if they match
5. Stores the source code for public browsing on `stellar-scan-web`

This is similar to Etherscan's source verification — but designed for Soroban's Rust/WASM build pipeline.

---

## File Structure

```
stellar-scan-verify/
│
├── Cargo.toml                             # Rust workspace (build pipeline)
├── package.json                           # TypeScript service
├── tsconfig.json
├── README.md                              # This file
├── CONTRIBUTING.md
├── LICENSE
├── CODEOWNERS
├── .gitignore
├── .env.example
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                         # Lint, test, Rust checks on every PR
│   │   └── docker.yml                    # Build Docker verification image on main
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── stellar_wave_task.md
│
├── src/                                   # TypeScript service layer
│   ├── index.ts                           # Fastify service — exposes verify endpoints
│   │
│   ├── pipeline/
│   │   ├── job_queue.ts                   # Verification job queue (BullMQ / Redis)
│   │   ├── job_runner.ts                  # Spawns Docker build container per job
│   │   ├── source_receiver.ts             # Accepts zip upload or GitHub URL
│   │   └── job_status.ts                  # Tracks and exposes job status via SSE
│   │
│   ├── comparator/
│   │   ├── hash_fetcher.ts                # Fetches on-chain WASM hash via Stellar RPC
│   │   ├── wasm_hash.ts                   # SHA-256 of WASM binary (Stellar's method)
│   │   └── compare.ts                     # Compares built hash vs on-chain hash
│   │
│   ├── storage/
│   │   ├── db.ts                          # pg connection to stellar-scan DB
│   │   ├── source_store.ts                # Stores verified source files (fs / S3)
│   │   └── verification_repo.ts           # Writes verification result to contracts table
│   │
│   └── utils/
│       ├── logger.ts
│       ├── docker.ts                      # Docker SDK helpers (spawn + stream logs)
│       ├── github.ts                      # Clone repo at specific commit hash
│       └── validators.ts                  # Input validation for verification requests
│
├── rust-builder/                          # Rust crate: deterministic WASM build helper
│   ├── Cargo.toml
│   ├── src/
│   │   ├── main.rs                        # CLI: build contract + output WASM hash
│   │   ├── builder.rs                     # Runs `cargo build --target wasm32-unknown-unknown`
│   │   └── hasher.rs                      # Computes SHA-256 of WASM binary output
│   └── tests/
│       └── hash_determinism.rs            # Verifies same source = same hash across runs
│
├── docker/
│   ├── Dockerfile.builder                 # Reproducible Rust build environment
│   │                                      # (pinned Rust version, WASM target, soroban-cli)
│   └── Dockerfile.service                 # TypeScript service container
│
└── tests/
    ├── unit/
    │   ├── wasm_hash.test.ts
    │   ├── compare.test.ts
    │   └── source_receiver.test.ts
    │
    └── integration/
        ├── verification_flow.test.ts      # End-to-end: submit source → get verified result
        └── hash_match.test.ts             # Known contract source → expected hash
```

---

## How Verification Works

```
Developer submits source
        │
        ▼
┌─────────────────────────┐
│  Source Receiver        │  ← Accepts zip or GitHub URL + commit SHA
│  (source_receiver.ts)   │
└──────────┬──────────────┘
           │ queues job
           ▼
┌─────────────────────────┐
│  Job Queue (BullMQ)     │
└──────────┬──────────────┘
           │ picks up job
           ▼
┌─────────────────────────┐
│  Docker Build Container │  ← Pinned Rust 1.75, wasm32-unknown-unknown
│  (Dockerfile.builder)   │    cargo build --release
└──────────┬──────────────┘
           │ built WASM
           ▼
┌─────────────────────────┐
│  Hash Comparator        │  ← SHA-256(built WASM) vs getContractWasm(contractId)
│  (comparator/)          │
└──────────┬──────────────┘
           │ result
           ▼
  ✅ Match → mark contract Verified, store source
  ❌ No match → return diff report
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/verify` | Submit source for verification (multipart: zip + contractId + network) |
| `GET` | `/verify/:jobId` | Poll verification job status |
| `GET` | `/verify/:jobId/stream` | SSE stream of build logs |
| `GET` | `/health` | Service health |

### Submit Verification Example

```bash
curl -X POST https://api.stellarscan.io/verify \
  -F "source=@./my-contract.zip" \
  -F "contractId=CXXXXXXX..." \
  -F "network=mainnet" \
  -F "rustVersion=1.75.0"
```

### Response

```json
{
  "jobId": "verify_abc123",
  "status": "queued",
  "statusUrl": "/verify/verify_abc123"
}
```

---

## Reproducible Builds

The build container pins:
- **Rust version**: set per-submission via `rustup override`
- **WASM target**: `wasm32-unknown-unknown`
- **Build flags**: `--release --target wasm32-unknown-unknown`
- **soroban-cli**: version pinned in `Dockerfile.builder`

The same source at the same toolchain version must produce the same WASM hash for verification to pass.

---

## Running Locally

### Prerequisites

- Docker Desktop or Docker Engine
- Node.js 20+
- Redis (for job queue)

```bash
git clone https://github.com/stellar-scan/stellar-scan-verify
cd stellar-scan-verify
cp .env.example .env
npm install
docker build -f docker/Dockerfile.builder -t soroban-builder .
npm run dev
```

### Run Rust Tests

```bash
cd rust-builder
cargo test
```

---

## Environment Variables

```
DATABASE_URL=postgresql://user:password@localhost:5432/stellar_scan
REDIS_URL=redis://localhost:6379
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
SOURCE_STORAGE_PATH=./storage/sources
PORT=3003
LOG_LEVEL=info
```

---

## Stellar Wave — Open Issues

Browse: [github.com/stellar-scan/stellar-scan-verify/issues](https://github.com/stellar-scan/stellar-scan-verify/issues?q=label%3A%22Stellar+Wave%22)

**Points:** Trivial = 100 pts | Medium = 150 pts | High = 200 pts

Full rules: [docs.drips.network/wave/terms-and-rules](https://docs.drips.network/wave/terms-and-rules)

---

## License

MIT — see [LICENSE](LICENSE)
