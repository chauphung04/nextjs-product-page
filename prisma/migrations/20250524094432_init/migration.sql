-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "productName" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "images" TEXT[],
    "barcode" TEXT,
    "description" TEXT,
    "itemWeight" DOUBLE PRECISION,
    "weightUnit" TEXT,
    "ingredients" TEXT[],
    "storage" TEXT[],
    "itemsPerPack" INTEGER,
    "color" TEXT,
    "material" TEXT,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "warranty" INTEGER,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
