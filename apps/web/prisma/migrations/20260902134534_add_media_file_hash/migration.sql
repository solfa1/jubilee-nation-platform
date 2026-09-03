ALTER TABLE "MediaSubmission"
ADD COLUMN "fileHash" TEXT;

UPDATE "MediaSubmission"
SET "fileHash" = 'legacy-' || "id";

ALTER TABLE "MediaSubmission"
ALTER COLUMN "fileHash" SET NOT NULL;

CREATE UNIQUE INDEX
"MediaSubmission_eventId_contactId_fileHash_key"
ON "MediaSubmission"("eventId", "contactId", "fileHash");