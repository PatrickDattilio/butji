-- CreateTable
CREATE TABLE "DataCenter" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "project" TEXT,
    "address" TEXT,
    "latitude" TEXT,
    "longitude" TEXT,
    "timelapseImageUrl" TEXT,
    "ownerCompanyId" TEXT,
    "currentH100Equivalents" DOUBLE PRECISION,
    "currentPowerMW" DOUBLE PRECISION,
    "currentCapitalCostUSD" DOUBLE PRECISION,
    "investors" TEXT,
    "constructionCompanies" TEXT,
    "energyCompanies" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyDataCenterUser" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "dataCenterId" TEXT NOT NULL,
    "confidence" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyDataCenterUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataCenter_handle_key" ON "DataCenter"("handle");

-- CreateIndex
CREATE INDEX "DataCenter_ownerCompanyId_idx" ON "DataCenter"("ownerCompanyId");

-- CreateIndex
CREATE INDEX "DataCenter_handle_idx" ON "DataCenter"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyDataCenterUser_companyId_dataCenterId_key" ON "CompanyDataCenterUser"("companyId", "dataCenterId");

-- CreateIndex
CREATE INDEX "CompanyDataCenterUser_companyId_idx" ON "CompanyDataCenterUser"("companyId");

-- CreateIndex
CREATE INDEX "CompanyDataCenterUser_dataCenterId_idx" ON "CompanyDataCenterUser"("dataCenterId");

-- AddForeignKey
ALTER TABLE "DataCenter" ADD CONSTRAINT "DataCenter_ownerCompanyId_fkey" FOREIGN KEY ("ownerCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyDataCenterUser" ADD CONSTRAINT "CompanyDataCenterUser_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyDataCenterUser" ADD CONSTRAINT "CompanyDataCenterUser_dataCenterId_fkey" FOREIGN KEY ("dataCenterId") REFERENCES "DataCenter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
