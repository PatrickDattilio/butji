-- CreateTable
CREATE TABLE "Company" (
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
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Company_approved_idx" ON "Company"("approved");

-- CreateIndex
CREATE INDEX "Company_name_idx" ON "Company"("name");
