-- CreateTable
CREATE TABLE "ContentIdea" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "hook" TEXT NOT NULL,
    "structure" TEXT[],
    "caption" TEXT NOT NULL,
    "hashtags" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "freeInput" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentIdea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentScript" (
    "id" SERIAL NOT NULL,
    "contentIdeaId" INTEGER NOT NULL,
    "videoTitle" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "timeline" JSONB NOT NULL,
    "fullScript" TEXT NOT NULL,
    "shootingInstructions" JSONB NOT NULL,
    "telops" TEXT[],
    "captionText" TEXT NOT NULL,
    "hashtags" TEXT NOT NULL,
    "thumbnailIdea" TEXT NOT NULL,
    "estimatedDuration" TEXT NOT NULL,
    "whyItWorks" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentScript_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContentIdea" ADD CONSTRAINT "ContentIdea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentScript" ADD CONSTRAINT "ContentScript_contentIdeaId_fkey" FOREIGN KEY ("contentIdeaId") REFERENCES "ContentIdea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
