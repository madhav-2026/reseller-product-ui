import React, { useState } from 'react';
import axios from 'axios';

const AdminAddProduct = () => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [image, setImage] = useState(null);
    const [weightOptions, setWeightOptions] = useState(''); // comma-separated string

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) return alert("Please select an image");

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('quantity', quantity);
        formData.append('image', image);
        formData.append('weightOptions', weightOptions);

        try {
            axios.defaults.headers.common['Authorization'] = `Basic ${sessionStorage.getItem('auth')}`;
            // Parse weightOptions as array of numbers if provided
            if (weightOptions.trim()) {
                const arr = weightOptions.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
                formData.append('weightOptions', JSON.stringify(arr));
            }
            axios.post('http://localhost:9090/api/upload', formData, {
                headers: {
                    Authorization: 'Basic ' + btoa('admin:admin123'),
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            })

            alert('Product added successfully!');
            setName('');
            setPrice('');
            setQuantity('');
            setImage(null);
            setWeightOptions('');
        } catch (error) {
            alert('Error uploading product');
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Add Product</h2>
            <input
                type="text"
                placeholder="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border p-2 mb-2 w-full"
            />
            <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="border p-2 mb-2 w-full"
            />
            <input
                type="text"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="border p-2 mb-2 w-full"
            />
            <input
                type="text"
                placeholder="Weight Options (comma separated, e.g. 100,200,250,500,1000)"
                value={weightOptions}
                onChange={e => setWeightOptions(e.target.value)}
                className="border p-2 mb-2 w-full"
            />
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="mb-2 w-full"
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Add Product
            </button>
        </form>
    );
};

export default AdminAddProduct;
