/*
  Warnings:

  - A unique constraint covering the columns `[content,sourceId]` on the table `Clipping` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Clipping_content_sourceId_key" ON "Clipping"("content", "sourceId");
