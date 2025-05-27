"use client"; // This component runs on the client-side

import { useState, useEffect } from "react";
import { FiUpload, FiX } from "react-icons/fi"; 
import ProductCard from "@/components/ProductCard";
import ProductUploadForm from "@/components/ProductUploadForm";
import { Product, ProductCreate } from "@/types/product"; // Ensure ProductCreate is imported

export default function Home() {
  // Initialize products state as an empty array, as data will be fetched dynamically
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState<string | null>(null); // State for error messages
  const [formVisible, setFormVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");


  // Function to fetch all products from the database
  const fetchAllProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      
      const res = await fetch(`/api/product`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to fetch products: ${res.statusText}`);
      }

      const responseData = await res.json();
      // The API should return an array of products, ensure it matches your Product type
      setProducts(responseData.products);
      console.log("Products fetched from DB:", responseData.products);
    } catch (err: any) {
      console.error("Error fetching all products:", err);
      setError(err.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  // Use useEffect to fetch products when the component mounts
  useEffect(() => {
    fetchAllProducts();
  }, []); // Empty dependency array means this runs once on mount

  const handleAddProduct = async (newProductData: ProductCreate) => {
    try {
      const res = await fetch("/api/create-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProductData),
      });

      if (!res.ok) {
        throw new Error(`Failed to add product: ${res.statusText}`);
      }

      const responseData = await res.json();
      const addedProduct: Product = responseData.product;

      // Update the state with the new, fully-fledged Product
      setProducts((prev) => [addedProduct, ...prev]);
      setFormVisible(false);
      console.log("Product added to database and UI:", addedProduct);

    } catch (error: any) {
      console.error("Error adding product:", error);
      setError(error.message || "Failed to add product.");
      // TODO: Implement user feedback (e.g., toast notification) for the error
    }
  };

  const filteredProducts = products.filter((product) =>
    `${product.productName} ${product.brand}`.toLowerCase().includes(searchTerm.toLowerCase())
  );


  //Render:
  return (
    <main className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 md:mb-0">
          Product Enrichment
        </h1>
        <button
          onClick={() => setFormVisible((prev) => !prev)}
          className={`
            inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold
            transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${
              formVisible
                ? "bg-red-600 text-white hover:bg-red-700 focus:ring-blue-500"
                : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
            }
          `}
          aria-label={formVisible ? "Cancel upload form" : "Show upload form"}
        >
          {formVisible ? <><FiX className="w-5 h-5" /> Cancel Upload</> : <><FiUpload className="w-5 h-5" /> Upload Product</>}
        </button>
      </header>
      <div className="mb-6 flex justify-center">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 3a7.5 7.5 0 006.15 13.65z"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by product name or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:bg-gray-100"
          />

        </div>
      </div>


      {/* Conditional form */}
      {formVisible && (
        <ProductUploadForm
          onSubmit={handleAddProduct}
          onCancel={() => setFormVisible(false)}
          isOpen={formVisible}
        />
      )}

      {/* Content */}
      {loading ? (
        <p className="text-gray-600">Loading products...</p>
      ) : error ? (
        <p className="text-red-500 font-medium">Error: {error}</p>
      ) : products.length === 0 ? (
        <p className="text-gray-600">No products found. Start by uploading one!</p>
      ) : (
        filteredProducts.length === 0 ? (
          <p className="text-gray-600">No matching products found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} initialProduct={product} />
            ))}
          </div>
        )
      )}
    </main>
  );
}