/*
  Warnings:

  - A unique constraint covering the columns `[firebaseUid]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AnalysisResult" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "JobDescription" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Resume" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firebaseUid" TEXT,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");
