import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

function ProductList({ cart, setCart, selectedCategory, searchTerm, refreshProducts, user }) {
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

  // Update the grid to remove all gaps between product cards

  return (
    <div className="w-full max-w-sm sm:max-w-3xl mx-auto p-0 sm:p-0">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-0">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No products found.
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id || product._id}
              product={product}
              addToCart={prod => setCart(prev => [...prev, prod])}
              user={user}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ProductList;
