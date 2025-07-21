import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

function ProductList({ cart, setCart, selectedCategory, searchTerm, refreshProducts }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:9090/api/products", {
      withCredentials: false
    })
    .then((res) => setProducts(res.data))
    .catch((err) => console.error(err));
  }, [refreshProducts]); // Add refreshProducts here

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  // Filtering logic
  const filteredProducts = products.filter(product => {
    // Always apply search filter
    const matchesSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase());

    // If Groceries is selected, show all products from backend (no category filter, but apply search)
    if (selectedCategory === "Groceries") {
      return matchesSearch;
    }
    // Otherwise, filter by category and search
    const matchesCategory = product.category === selectedCategory;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full py-8">
          <div className="text-center text-gray-500 mb-4">No products found.</div>
          <button
            className="px-6 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
            onClick={() => {
              // Optional: If you want to close the cart or reset search/category, call the appropriate function here.
              // Example: setShowCart && setShowCart(false);
              // If you want to clear search:
              // setSearchTerm && setSearchTerm("");
            }}
          >
            Close
          </button>
        </div>
      ) : (
        filteredProducts.map((p) => (
          <ProductCard key={p.id} product={p} addToCart={addToCart} />
        ))
      )}
    </div>
  );
}

export default ProductList;
