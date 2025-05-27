"use client";
import React, { useEffect, useState } from "react";
import { ProductCreate} from "@/types/product";
import { FiChevronRight } from "react-icons/fi";

type ProductUploadFormProps = {
  onSubmit: (product: ProductCreate) => void;
  onCancel?: () => void;
  isOpen: boolean;
};

export default function ProductUploadForm({
  onSubmit,
  onCancel,
  isOpen,
}: ProductUploadFormProps) {
  const [formData, setFormData] = useState({
    productName: "",
    brand: "",
    images: "",
    barcode: "",
  });

  const [isMounted, setIsMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  // Handle mount/unmount with animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsMounted(true);
    } else {
      setIsMounted(false);
      const timer = setTimeout(() => setShouldRender(false), 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: ProductCreate = {
      productName: formData.productName,
      brand: formData.brand,
      images: formData.images
        ? formData.images.split(",").map((url) => url.trim())
        : [],
      barcode: formData.barcode,
      description: "",
      itemWeight: null,
      ingredients: [],
      storage: [],
      itemsPerPack: null,
      color: "",
      material: "",
      width: null,
      height: null,
      warranty: null,
    };

    onSubmit(newProduct);
    setFormData({ productName: "", brand: "", images: "", barcode: "" });
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <>
      {/* Backdrop with transition */}
      <div
        onClick={onCancel}
        className={`
          fixed inset-0 bg-black z-40
          transition-opacity duration-300 ease-in-out
          ${isMounted ? "bg-opacity-40 backdrop-blur-sm" : "bg-opacity-0 backdrop-blur-0"}
        `}
      />

      {/* Sidebar with enhanced transition */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50
          flex flex-col overflow-y-auto p-6
          transform transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isMounted ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        `}
      >
        {/* Top bar with improved back button */}
        <div className="flex items-center mb-6">
          <button
            onClick={onCancel}
            className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-all mr-2"
            aria-label="Close sidebar"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">
            Upload New Product
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 flex-grow">
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              required
              value={formData.productName}
              onChange={(e) =>
                setFormData({ ...formData, productName: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Brand
            </label>
            <input
              type="text"
              required
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter brand"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Images (comma-separated URLs)
            </label>
            <input
              type="text"
              value={formData.images}
              onChange={(e) =>
                setFormData({ ...formData, images: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Barcode (optional)
            </label>
            <input
              type="text"
              value={formData.barcode}
              onChange={(e) =>
                setFormData({ ...formData, barcode: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter barcode"
            />
          </div>

          <div className="flex gap-4 mt-auto pt-4">
            <button
              type="submit"
              className="flex-grow bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all active:scale-[0.98]"
            >
              Add Product
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}