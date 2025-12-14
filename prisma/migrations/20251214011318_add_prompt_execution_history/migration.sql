-- CreateTable
CREATE TABLE "PromptExecution" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "versionLabel" TEXT,
    "systemPrompt" TEXT NOT NULL,
    "userPrompt" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "PromptExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromptExecution_promptId_idx" ON "PromptExecution"("promptId");

-- CreateIndex
CREATE INDEX "PromptExecution_createdAt_idx" ON "PromptExecution"("createdAt");

-- AddForeignKey
ALTER TABLE "PromptExecution" ADD CONSTRAINT "PromptExecution_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
