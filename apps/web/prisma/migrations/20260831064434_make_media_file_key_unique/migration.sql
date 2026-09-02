/*
  Warnings:

  - A unique constraint covering the columns `[fileKey]` on the table `MediaSubmission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MediaSubmission_fileKey_key" ON "MediaSubmission"("fileKey");
