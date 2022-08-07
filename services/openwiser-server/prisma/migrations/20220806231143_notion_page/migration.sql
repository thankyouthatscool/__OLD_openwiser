-- CreateTable
CREATE TABLE "NotionPage" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,

    CONSTRAINT "NotionPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotionPage_sourceId_key" ON "NotionPage"("sourceId");

-- AddForeignKey
ALTER TABLE "NotionPage" ADD CONSTRAINT "NotionPage_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
