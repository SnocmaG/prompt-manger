/*
  Warnings:

  - You are about to drop the column `liveBranchId` on the `Prompt` table. All the data in the column will be lost.
  - You are about to drop the column `webhookUrl` on the `Prompt` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `PromptVersion` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `PromptVersion` table. All the data in the column will be lost.
  - You are about to drop the column `parentVersionId` on the `PromptVersion` table. All the data in the column will be lost.
  - You are about to drop the `Branch` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `promptId` to the `PromptVersion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `systemPrompt` to the `PromptVersion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userPrompt` to the `PromptVersion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_promptId_fkey";

-- DropForeignKey
ALTER TABLE "PromptVersion" DROP CONSTRAINT "PromptVersion_branchId_fkey";

-- DropIndex
DROP INDEX "PromptVersion_branchId_idx";

-- AlterTable
ALTER TABLE "Prompt" DROP COLUMN "liveBranchId",
DROP COLUMN "webhookUrl",
ADD COLUMN     "liveVersionId" TEXT;

-- AlterTable
ALTER TABLE "PromptVersion" DROP COLUMN "branchId",
DROP COLUMN "content",
DROP COLUMN "parentVersionId",
ADD COLUMN     "promptId" TEXT NOT NULL,
ADD COLUMN     "systemPrompt" TEXT NOT NULL,
ADD COLUMN     "userPrompt" TEXT NOT NULL;

-- DropTable
DROP TABLE "Branch";

-- CreateIndex
CREATE INDEX "PromptVersion_promptId_idx" ON "PromptVersion"("promptId");

-- AddForeignKey
ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
