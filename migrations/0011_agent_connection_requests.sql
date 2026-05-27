CREATE TABLE "AgentConnectionRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviceCodeHash" TEXT NOT NULL,
    "userCode" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "scopes" TEXT NOT NULL DEFAULT 'kitchen:read kitchen:write',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedById" TEXT,
    "credentialId" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "approvedAt" DATETIME,
    "deniedAt" DATETIME,
    "claimedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgentConnectionRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AgentConnectionRequest_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "ApiCredential" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "AgentConnectionRequest_deviceCodeHash_key" ON "AgentConnectionRequest"("deviceCodeHash");
CREATE UNIQUE INDEX "AgentConnectionRequest_userCode_key" ON "AgentConnectionRequest"("userCode");
CREATE INDEX "AgentConnectionRequest_approvedById_idx" ON "AgentConnectionRequest"("approvedById");
CREATE INDEX "AgentConnectionRequest_credentialId_idx" ON "AgentConnectionRequest"("credentialId");
CREATE INDEX "AgentConnectionRequest_status_expiresAt_idx" ON "AgentConnectionRequest"("status", "expiresAt");
