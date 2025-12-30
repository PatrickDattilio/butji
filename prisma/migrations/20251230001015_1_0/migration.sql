-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedBy" TEXT,
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT,
    "rejectionReason" TEXT
);

-- CreateIndex
CREATE INDEX "Resource_approved_idx" ON "Resource"("approved");

-- CreateIndex
CREATE INDEX "Resource_category_idx" ON "Resource"("category");

-- CreateIndex
CREATE INDEX "Submission_status_idx" ON "Submission"("status");

-- CreateIndex
CREATE INDEX "Submission_category_idx" ON "Submission"("category");
