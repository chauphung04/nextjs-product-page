"use client";
import { Product } from "@/types/product";
import { useState } from 'react';
import { createPortal } from "react-dom";


interface Props {
    initialProduct: Product;
}

export default function ProductCard({ initialProduct }: Props) {
  const [product, setProduct] = useState<Product>(initialProduct);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  console.log("ProductCard rendered with product:", product);

  const handleEnrich = async () => {
    setLoading(true);
    try {
      // --- Call AI enrichment API ---
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
      });

      if (!res.ok) {
        throw new Error(`AI enrichment failed: ${res.statusText}`);
      }

      const { enriched } = await res.json(); // 'enriched' comes from AI

      // --- Prepare data for DB save ---
      const dataForSaveAPI = {
        id: enriched.id,
        productName: enriched.productName,
        brand: enriched.brand,
        barcode: enriched.barcode || null,
        images: enriched.images || [],
        description: enriched.description || "",
        itemWeight:
          enriched.itemWeight?.value !== undefined
            ? Number(enriched.itemWeight.value)
            : null,
        weightUnit: enriched.itemWeight?.unit ?? null,
        ingredients: Array.isArray(enriched.ingredients)
          ? enriched.ingredients
          : [],
        storage: Array.isArray(enriched.storage)
          ? enriched.storage
          : enriched.storage
          ? [enriched.storage]
          : [],
        itemsPerPack:
          enriched.itemsPerPack !== undefined
            ? Number(enriched.itemsPerPack)
            : null,
        color: enriched.color || null,
        material: enriched.material || null,
        width:
          enriched.width?.value !== undefined
            ? Number(enriched.width.value)
            : null,
        widthUnit: enriched.width?.unit ?? null,
        height:
          enriched.height?.value !== undefined
            ? Number(enriched.height.value)
            : null,
        heightUnit: enriched.height?.unit ?? null,
        warranty:
          typeof enriched.warranty === "number" ? enriched.warranty : null,
      };

      // --- Save to DB ---
      const saveRes = await fetch("/api/save-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enriched: dataForSaveAPI }),
      });

      if (!saveRes.ok) {
        throw new Error(
          `Failed to save enriched product: ${saveRes.statusText}`
        );
      }

      const { updatedProduct: savedProduct } = await saveRes.json();

      // --- Update UI ---
      setProduct(savedProduct);
      console.log("Product enriched and saved. UI updated with:", savedProduct);
    } catch (err) {
      console.error("Enrichment or save failed:", err);
      // Optionally toast error here
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/delete-product", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id }),
      });

      if (!res.ok) throw new Error("Failed to delete");

      // You might want to notify parent via callback or redirect
      alert("Product deleted successfully.");
      window.location.reload(); // or trigger a parent update
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete product.");
    }
  };

  return (
    <div className="relative border rounded-2xl p-6 shadow-lg mb-6 bg-white h-[30rem] flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.01]">
      {/* Fixed-height container for product name & brand */}
      <div className="min-h-[4rem] mb-2">
        <h2
          className="text-xl font-semibold text-gray-800 line-clamp-2 overflow-hidden"
          title={product.productName}
        >
          {product.productName}
        </h2>
        <p
          className="text-xs text-gray-500 truncate"
          title={product.brand}
        >
          {product.brand}
        </p>
      </div>

      {/* Image Thumbnails - Reduced height */}
      <div className="flex gap-2 mt-2 flex-wrap min-h-[3.5rem]">
        {Array.isArray(product.images) && product.images.length > 0 ? (
          product.images.slice(0, 3).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${product.productName} ${idx + 1}`}
              className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer"
              onClick={() => setSelectedImage(img)}
            />
          ))
        ) : (
          <div className="w-16 h-16 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400 text-xs select-none">
            No Image
          </div>
        )}
      </div>

      {/* Modal for full-size image */}
      {selectedImage &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
            <div className="relative">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 text-white text-xl bg-black bg-opacity-60 rounded-full p-1 hover:bg-opacity-80"
                aria-label="Close"
              >
                ×
              </button>
              <img
                src={selectedImage}
                alt="Full size"
                className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-lg"
              />
            </div>
          </div>,
          document.body
        )
      }


      <button
        onClick={handleEnrich}
        disabled={loading}
        className={`mt-4 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95
          ${
            loading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 focus:ring-blue-400"
          }`}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin w-4 h-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Please wait...
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Enrich with AI
          </>
        )}
      </button>

      {/* Enriched Fields Table with slim scrollbar */}
      <div className="mt-3 flex-grow overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
        <table className="min-w-full text-xs border-separate [border-spacing:0]">
          <tbody className="divide-y divide-gray-200">
            {product.description && (
              <tr className="bg-gray-50">
                <td className="py-2 px-3 font-medium text-gray-700 w-1/3">Description</td>
                <td className="py-2 px-3 text-gray-800"dangerouslySetInnerHTML={{ __html: product.description }}></td>
              </tr>
            )}
            {product.itemWeight && (
              <tr>
                <td className="py-2 px-3 font-medium text-gray-700">Weight</td>
                <td className="py-2 px-3 text-gray-800">
                  {product.itemWeight.value} {product.itemWeight.unit}
                </td>
              </tr>
            )}
            {product.ingredients?.length > 0 && (
              <tr className="bg-gray-50">
                <td className="py-2 px-3 font-medium text-gray-700">Ingredients</td>
                <td className="py-2 px-3 text-gray-800">{product.ingredients.join(", ")}</td>
              </tr>
            )}
            {product.storage?.length > 0 && (
              <tr>
                <td className="py-2 px-3 font-medium text-gray-700">Storage</td>
                <td className="py-2 px-3 text-gray-800 line-clamp-2">{product.storage.join(", ")}</td>
              </tr>
            )}
            {product.itemsPerPack && (
              <tr className="bg-gray-50">
                <td className="py-2 px-3 font-medium text-gray-700">Items/Pack</td>
                <td className="py-2 px-3 text-gray-800">{product.itemsPerPack}</td>
              </tr>
            )}
            {product.color && (
              <tr>
                <td className="py-2 px-3 font-medium text-gray-700">Color</td>
                <td className="py-2 px-3 text-gray-800">{product.color}</td>
              </tr>
            )}
            {product.material && (
              <tr className="bg-gray-50">
                <td className="py-2 px-3 font-medium text-gray-700">Material</td>
                <td className="py-2 px-3 text-gray-800">{product.material}</td>
              </tr>
            )}
            {product.width && (
              <tr>
                <td className="py-2 px-3 font-medium text-gray-700">Width</td>
                <td className="py-2 px-3 text-gray-800">
                  {product.width.value} {product.width.unit}
                </td>
              </tr>
            )}
            {product.height && (
              <tr className="bg-gray-50">
                <td className="py-2 px-3 font-medium text-gray-700">Height</td>
                <td className="py-2 px-3 text-gray-800">
                  {product.height.value} {product.height.unit}
                </td>
              </tr>
            )}
            {typeof product.warranty === "number" && (
              <tr>
                <td className="py-2 px-3 font-medium text-gray-700">Warranty</td>
                <td className="py-2 px-3 text-gray-800">{product.warranty} year(s)</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hover:scale-110 transition-all"
        aria-label="Delete Product"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 8.586L4.707 3.293a1 1 0 10-1.414 1.414L8.586 10l-5.293 5.293a1 1 0 001.414 1.414L10 11.414l5.293 5.293a1 1 0 001.414-1.414L11.414 10l5.293-5.293a1 1 0 00-1.414-1.414L10 8.586z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );

}