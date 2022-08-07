/*
  Warnings:

  - Added the required column `notionId` to the `NotionPage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NotionPage" ADD COLUMN     "notionId" TEXT NOT NULL;
