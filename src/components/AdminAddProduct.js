import React, { useState } from 'react';
import axios from 'axios';

function AdminAddProduct({ setShowAdmin, setSelectedCategory }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [images, setImages] = useState([]); // <-- changed from image to images array
  const [weightOptions, setWeightOptions] = useState(''); // comma-separated string

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!images.length) return alert("Please select at least one image");

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('quantity', quantity);

    // Append all images with the same key as backend expects
    for (let i = 0; i < images.length; i++) {
      formData.append('image', images[i]);
    }

    // Parse weightOptions as array of numbers if provided
    if (weightOptions.trim()) {
      const arr = weightOptions.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      formData.append('weightOptions', JSON.stringify(arr));
    }

    try {
      axios.defaults.headers.common['Authorization'] = `Basic ${sessionStorage.getItem('auth')}`;
      await axios.post('http://localhost:9090/api/upload', formData, {
        headers: {
          Authorization: 'Basic ' + btoa('admin:admin123'),
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      alert('Product added successfully!');
      setName('');
      setPrice('');
      setQuantity('');
      setImages([]); // <-- reset images
      setWeightOptions('');
    } catch (error) {
      alert('Error uploading product');
      console.error(error);
    }
  };

  return (
    <div className="w-full max-w-sm sm:max-w-xl mx-auto p-4 sm:p-8 bg-white rounded-2xl shadow-lg border border-gray-100 mt-4">
      <h2 className="text-lg sm:text-2xl font-bold text-purple-700 mb-4 text-center">Add New Product</h2>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="text"
          className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-purple-400 w-full"
          placeholder="Product Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          type="number"
          className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-purple-400 w-full"
          placeholder="Price"
          value={price}
          onChange={e => setPrice(e.target.value)}
        />
        <input
          type="text"
          className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-purple-400 w-full"
          placeholder="Quantity"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
        />
        <input
          type="text"
          className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-purple-400 w-full"
          placeholder="Weight Options (comma separated, e.g. 100,200,250,500,1000)"
          value={weightOptions}
          onChange={e => setWeightOptions(e.target.value)}
        />
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={e => setImages(Array.from(e.target.files))}
          className="mb-2 w-full"
        />
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg shadow transition"
        >
          Add Product
        </button>
        <button
          type="button"
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg shadow transition mt-2"
          onClick={() => {
            if (setShowAdmin) setShowAdmin(false);
            if (setSelectedCategory) setSelectedCategory("Groceries");
          }}
        >
          Go To Products
        </button>
      </form>
    </div>
  );
}

export default AdminAddProduct;
