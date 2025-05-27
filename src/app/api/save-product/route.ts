// api/save-product/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@/generated/prisma";
import { Product } from "@/types/product";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { enriched } = await req.json();
    console.log("Save-Product: Received 'enriched' object:", JSON.stringify(enriched, null, 2));

    const productId = enriched.id;

    if (typeof productId !== 'number') {
        console.error("Enriched data missing valid ID:", enriched);
        return NextResponse.json(
            { success: false, error: "Missing or invalid product ID from AI response" },
            { status: 400 }
        );
    }

    // Fetch the original product to get its info
    const originalProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { productName: true, brand: true, images: true, barcode: true} // Only fetch what's needed
    });

    if (!originalProduct) {
      return NextResponse.json({ success: false, error: "Product not found for update with the provided ID." }, { status: 404 });
    }

    const updateData = {
      // Preserve original values as per your requirement
      productName: originalProduct.productName,
      brand: originalProduct.brand,
      barcode: originalProduct.barcode,
      images: originalProduct.images,

      // Enhanced field processing - DIRECTLY USE THE FLATTENED VALUES RECEIVED
      description: enriched.description ?? null,
      itemWeight: enriched.itemWeight !== undefined ? Number(enriched.itemWeight) : null, // <-- FIX THIS
      weightUnit: enriched.weightUnit ?? null, // 
      ingredients: Array.isArray(enriched.ingredients) ? enriched.ingredients : [],
      storage: Array.isArray(enriched.storage)
        ? enriched.storage
        : enriched.storage
          ? [enriched.storage]
          : [],
      itemsPerPack: enriched.itemsPerPack !== undefined ? Number(enriched.itemsPerPack) : null, // This was already correct!
      color: enriched.color ?? null,
      material: enriched.material ?? null,
      width: enriched.width !== undefined ? Number(enriched.width) : null, // <-- FIX THIS
      widthUnit: enriched.widthUnit ?? null, // <-- FIX THIS
      height: enriched.height !== undefined ? Number(enriched.height) : null, // <-- FIX THIS
      heightUnit: enriched.heightUnit ?? null, // <-- FIX THIS
      warranty: enriched.warranty !== undefined ? Number(enriched.warranty) : null,
    };


    // Only remove undefined values (keep null and other falsy values)
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([, v]) => v !== undefined)
    );
    console.log("Save-Product: Data prepared for Prisma update:", JSON.stringify(cleanUpdateData, null, 2));

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: cleanUpdateData,
    });
    console.log("Save-Product: Product returned by Prisma after update:", JSON.stringify(updatedProduct, null, 2));


    // Explicitly construct the object to match the 'Product' interface
    const formattedUpdatedProductForFrontend: Product = {
      id: updatedProduct.id, 
      productName: updatedProduct.productName, // Direct map
      brand: updatedProduct.brand, 
      images: updatedProduct.images, 
      barcode: updatedProduct.barcode, 

      // Map DB's itemWeight/weightUnit to frontend's Measure type
      itemWeight: (updatedProduct.itemWeight !== null && updatedProduct.weightUnit !== null)
        ? { value: updatedProduct.itemWeight, unit: updatedProduct.weightUnit }
        : null,
      ingredients: updatedProduct.ingredients,
      description: updatedProduct.description, 
      storage: updatedProduct.storage, 
      itemsPerPack: updatedProduct.itemsPerPack,
      color: updatedProduct.color, 
      material: updatedProduct.material, 

      // Map DB's width/widthUnit to frontend's Measure type
      width: (updatedProduct.width !== null && updatedProduct.widthUnit !== null)
        ? { value: updatedProduct.width, unit: updatedProduct.widthUnit }
        : null,
      // Map DB's height/heightUnit to frontend's Measure type
      height: (updatedProduct.height !== null && updatedProduct.heightUnit !== null)
        ? { value: updatedProduct.height, unit: updatedProduct.heightUnit }
        : null,
      warranty: updatedProduct.warranty, 
    };

    return NextResponse.json({
      success: true,
      updatedProduct: formattedUpdatedProductForFrontend,
    });

  } catch (err) {
    console.error("Save error:", err);
    // Use Prisma.PrismaClientKnownRequestError for type safety
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return NextResponse.json({ success: false, error: "Product not found for update with the provided ID." }, { status: 404 });
    }
    if (err instanceof Error) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    } else {
      return NextResponse.json({ success: false, error: "An unknown error occurred" }, { status: 500 });
    }
  }
}