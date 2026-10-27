
# WebSocket Stock Pub/Sub System

A simple **Publish–Subscribe (Pub/Sub)** system built using **WebSockets** that supports:

* User authentication (`AUTH`)
* Stock subscription (`SUBSCRIBE`)
* Stock unsubscription (`UNSUBSCRIBE`)
* Publishing stock updates (`PUBLISH`)
* Real-time delivery only to subscribed users

---

## Features

* Real-time communication using WebSockets
* In-memory Pub/Sub using `Map`
* Stock-wise subscriptions
* Explicit authentication before any action
* Clean separation of subscribe, unsubscribe, and publish logic

---

##  Architecture Overview

```
Client ──▶ WebSocket Server ──▶ PubSubManager
   ▲              │
   └──── connectionMap ◀──────┘
```

### Core Responsibilities

* **WebSocket Server**: Handles connections & routes messages
* **PubSubManager**: Manages subscriptions
* **connectionMap**: Maps `userId → WebSocket`
* **Publisher**: Sends stock updates
* **Subscribers**: Receive only subscribed stock updates

---

##  Core Data Structures

```ts
Subscriptions: Map<stock, Set<userId>>
connectionMap: Map<userId, WebSocket>
```

---

##  Message Types

### 1️⃣ AUTH (Required)

Authenticates a user and stores their connection.

```json
{
  "type": "AUTH",
  "userId": "user1"
}
```

✅ On success, the user is added to `connectionMap`.



Without AUTH, **no subscribe, unsubscribe, or publish is allowed**.


### 2️⃣ SUBSCRIBE

Subscribe a user to a stock.

```json
{
  "type": "SUBSCRIBE",
  "userId": "user1",
  "stock": "AAPL"
}
```

---

### 3️⃣ UNSUBSCRIBE

Unsubscribe a user from a stock.

```json
{
  "type": "UNSUBSCRIBE",
  "userId": "user1",
  "stock": "AAPL"
}
```

---

### 4️⃣ PUBLISH

Publish a stock update to all subscribers.

```json
{
  "type": "PUBLISH",
  "stock": "AAPL",
  "price": 182.45
}
```

Subscribers receive:

```json
{
  "type": "STOCK_UPDATE",
  "stock": "AAPL",
  "data": {
    "price": 182.45
  }
}
```
---

##  Typical Client Flow

1. Connect to WebSocket
2. Send `AUTH`
3. Wait for `AUTH_SUCCESS`
4. Send `SUBSCRIBE`
5. Receive stock updates
6. Send `UNSUBSCRIBE` when needed

---

