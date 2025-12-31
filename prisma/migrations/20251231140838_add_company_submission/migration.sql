-- CreateTable
CREATE TABLE IF NOT EXISTS "CompanySubmission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "website" TEXT,
    "founders" TEXT NOT NULL,
    "ceo" TEXT,
    "foundedYear" INTEGER,
    "funding" TEXT,
    "valuation" TEXT,
    "products" TEXT NOT NULL,
    "controversies" TEXT,
    "layoffs" TEXT,
    "tags" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "rejectionReason" TEXT,

    CONSTRAINT "CompanySubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CompanySubmission_status_idx" ON "CompanySubmission"("status");
