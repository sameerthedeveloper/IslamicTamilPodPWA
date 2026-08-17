-- CreateTable
CREATE TABLE "Rights" (
    "id" SERIAL NOT NULL,
    "owner" TEXT NOT NULL,
    "scholarId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "licenseExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Rights_scholarId_idx" ON "Rights"("scholarId");

-- CreateIndex
CREATE INDEX "Rights_status_idx" ON "Rights"("status");

-- AddForeignKey
ALTER TABLE "Rights" ADD CONSTRAINT "Rights_scholarId_fkey" FOREIGN KEY ("scholarId") REFERENCES "Scholar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
