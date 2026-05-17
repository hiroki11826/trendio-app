-- Create MetaConnection table for Meta Business Login data
CREATE TABLE "MetaConnection" (
    "id" SERIAL PRIMARY KEY,
    "accessToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "pageId" TEXT,
    "igUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
