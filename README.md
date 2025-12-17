# Real-Time Crypto Feed Aggregator

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?&style=for-the-badge&logo=redis&logoColor=white)
![GraphQL](https://img.shields.io/badge/-GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

## Overview

This project is a **scalable, event-driven microservice** designed to ingest, normalize, and distribute cryptocurrency market data in real-time. It solves the challenge of handling high-concurrency WebSocket streams from multiple exchanges simultaneously while providing a unified data interface for downstream consumers (trading bots, frontends, and backtesting engines).

Built with **NestJS** and **Fastify** for maximum throughput, it leverages **Reactive Programming (RxJS)** to handle data streams efficiently.

## Architecture

The system follows a **Hexagonal Architecture** (Ports & Adapters) approach to decouple the exchange logic from the core domain:

1.  **Ingestion Layer (Producers):** Connects to WebSocket feeds of **Binance**, **Coinbase**, and **Kraken**. Uses the **Adapter Pattern** to standardize different API implementations.
2.  **Processing Layer (Domain):** Normalizes incoming raw data (Tickers, Trades) into a unified DTO format.
3.  **Distribution Layer (Consumers):**
    * **Redis Pub/Sub:** Delivers real-time ephemeral updates to UI clients.
    * **Redis Streams:** Provides a persistent, append-only log for reliable consumption by the Backtesting Engine (Java/Spring Boot).
    * **GraphQL API:** Exposes an efficient endpoint for flexible data querying (`getPrice`, `getVolume`).

## Key Features

* **Multi-Exchange Support:** Simultaneous connections to major exchanges via WebSockets.
* **High Concurrency:** Optimized Event Loop usage to handle thousands of messages per second.
* **Data Normalization:** Converts disparate JSON structures into a standard internal schema.
* **Hybrid Distribution:** Supports both "Fire-and-forget" (PubSub) and reliable streaming (Redis Streams).
* **Scalable API:** GraphQL endpoint implemented with code-first approach.
* **Containerized:** Fully Dockerized environment (App + Redis).

## Tech Stack

* **Core:** Node.js, NestJS, TypeScript.
* **Performance:** Fastify Adapter (replacing Express for lower latency).
* **Data Handling:** RxJS (Observables), Class-Validator.
* **Infrastructure:** Redis (Pub/Sub & Streams), Docker, Docker Compose.
* **API:** GraphQL (Mercurius/Apollo).

## Getting Started

### Prerequisites
* Node.js v18+
* Docker & Docker Compose

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/tu-usuario/crypto-feed-aggregator.git](https://github.com/tu-usuario/crypto-feed-aggregator.git)