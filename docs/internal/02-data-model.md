# Data Model (Phase 2 draft)

SQLite + Prisma (preferred). Keep DTOs stable to avoid UI churn.

```prisma
// prisma/schema.prisma (draft)
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  alerts    Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Signal {
  id           String   @id @default(cuid())
  symbol       String
  type         String
  price        Float
  targetPrice  Float?
  stopLoss     Float?
  leverage     Int?
  timeframe    String
  source       String
  confidence   Int
  timestamp    DateTime
  status       String
  pnl          Float?

  @@index([source, timestamp])
  @@index([status])
}

model Provider {
  id           String   @id @default(cuid())
  name         String
  type         String
  status       String
  lastSignalAt DateTime?
  winRate      Float    @default(0)
  signalCount  Int      @default(0)
}

model SavedFilter {
  id        String   @id @default(cuid())
  userId    String
  name      String
  criteria  Json
  createdAt DateTime @default(now())
}
```

Indices: `Signal(source,timestamp)`, `Signal(status)`, `Provider(status)`.

Migration plan: introduce schema in Phase 2; write services to read/write while keeping endpoint shapes.
