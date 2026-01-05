-- AlterTable
ALTER TABLE "Company" ADD COLUMN "slug" TEXT;

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_slug_key" ON "Resource"("slug");

-- CreateIndex
CREATE INDEX "Company_slug_idx" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Resource_slug_idx" ON "Resource"("slug");
