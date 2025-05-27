// app/api/create-product/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const newProduct = await prisma.product.create({
      data: {
        productName: data.productName,
        brand: data.brand,
        barcode: data.barcode || null,
        images: data.images || [],
        description: "",
        itemWeight: null,
        weightUnit: null,
        ingredients: [],
        storage: [],
        itemsPerPack: null,
        color: "",
        material: "",
        width: null,
        widthUnit: null,
        height: null,
        heightUnit: null,
        warranty: null
      }
    });

    return NextResponse.json({
        success: true,
        product: {
            ...newProduct,
            //productName: newProduct.productName, // add this field for frontend compatibility (the enrich field takes product_name; however the product_name here hasnt been in the database.)
            id: newProduct.id
        }
});

  } catch (err) {
    console.error("Create error:", err);
    return NextResponse.json({ success: false, error: "Failed to create product." }, { status: 500 });
  }
}
