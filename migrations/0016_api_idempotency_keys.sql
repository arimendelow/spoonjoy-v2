CREATE TABLE "ApiIdempotencyKey" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "credentialId" TEXT,
  "clientKey" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "operation" TEXT NOT NULL,
  "requestHash" TEXT NOT NULL,
  "responseStatus" INTEGER,
  "responseBody" TEXT,
  "expiresAt" DATETIME NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApiIdempotencyKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ApiIdempotencyKey_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "ApiCredential" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ApiIdempotencyKey_userId_clientKey_key_key" ON "ApiIdempotencyKey"("userId", "clientKey", "key");
CREATE INDEX "ApiIdempotencyKey_userId_createdAt_idx" ON "ApiIdempotencyKey"("userId", "createdAt");
CREATE INDEX "ApiIdempotencyKey_credentialId_idx" ON "ApiIdempotencyKey"("credentialId");
CREATE INDEX "ApiIdempotencyKey_expiresAt_idx" ON "ApiIdempotencyKey"("expiresAt");
