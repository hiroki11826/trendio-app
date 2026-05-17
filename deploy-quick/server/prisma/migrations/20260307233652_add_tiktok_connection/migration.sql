-- CreateTable
CREATE TABLE "TikTokConnection" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "openId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TikTokConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TikTokConnection_openId_key" ON "TikTokConnection"("openId");

-- AddForeignKey
ALTER TABLE "TikTokConnection" ADD CONSTRAINT "TikTokConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
