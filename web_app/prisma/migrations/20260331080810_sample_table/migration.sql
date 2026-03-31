-- CreateTable
CREATE TABLE "sample" (
    "id" TEXT NOT NULL,
    "sampleName" TEXT NOT NULL,
    "testDate" TIMESTAMP(3) NOT NULL,
    "metalType" TEXT NOT NULL,
    "concentration" DOUBLE PRECISION,
    "rgbValue" TEXT,
    "imagePath" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sample_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sample_userId_idx" ON "sample"("userId");

-- AddForeignKey
ALTER TABLE "sample" ADD CONSTRAINT "sample_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
