// app/api/product/route.ts
//GET products
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { Product } from "@/types/product"; 

const prisma = new PrismaClient();

export async function GET() {
  try {
    const productsFromDb = await prisma.product.findMany({});

    // Transform products to match the frontend's Product interface
    const formattedProducts: Product[] = productsFromDb.map(product => {
      return {
        id: product.id,
        productName: product.productName, //Direct map
        brand: product.brand,
        images: product.images,
        barcode: product.barcode,
        description: product.description,
        ingredients: product.ingredients,
        storage: product.storage,

        // --- TRANSFORMATIONS FOR MEASURE TYPES ---
        itemWeight: (product.itemWeight !== null && product.weightUnit !== null)
          ? { value: product.itemWeight, unit: product.weightUnit }
          : null,
        width: (product.width !== null && product.widthUnit !== null)
          ? { value: product.width, unit: product.widthUnit }
          : null,
        height: (product.height !== null && product.heightUnit !== null)
          ? { value: product.height, unit: product.heightUnit }
          : null,
        // --- END TRANSFORMATIONS ---

        itemsPerPack: product.itemsPerPack, 
        color: product.color,
        material: product.material,
        warranty: product.warranty,
      };
    });

    return NextResponse.json({
      success: true,
      products: formattedProducts,
    });
  } catch (err) {
    console.error("Fetch all products error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve products." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}