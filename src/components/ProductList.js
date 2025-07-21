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
    <div className="w-full max-w-sm sm:max-w-3xl mx-auto p-2 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12">
            No products found.
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id || product._id}
              product={product}
              addToCart={prod => setCart(prev => [...prev, prod])}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ProductList;
