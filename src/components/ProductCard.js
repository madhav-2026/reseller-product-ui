
import React, { useState } from 'react';

const ProductCard = ({ product, addToCart }) => {
    const [qty, setQty] = useState(1);
    // Detect if product is sold by weight (e.g., has unit 'kg' or 'g' in product.quantity or product.unit)
    const isWeightProduct =
        (product.unit && (product.unit.toLowerCase().includes('kg') || product.unit.toLowerCase().includes('g')))
        || (product.quantity && (product.quantity.toLowerCase().includes('kg') || product.quantity.toLowerCase().includes('g')));

    // Use product.weightOptions if present, else default [500, 1000, 2000]
    const weightOptions = isWeightProduct && Array.isArray(product.weightOptions) && product.weightOptions.length > 0
        ? product.weightOptions
        : [500, 1000, 2000];
    const [weight, setWeight] = useState(isWeightProduct ? weightOptions[0] : 1); // default to first option

    return (
        <div className="w-40 bg-white shadow-md rounded-lg p-2 m-2 flex flex-col items-center">
            <img
                src={`http://localhost:9090/${product.image}`}
                alt={product.name}
                className="w-24 h-24 object-cover rounded mb-2"
            />
            <h2 className="mt-2 text-lg font-semibold">{product.name}</h2>
            {isWeightProduct ? (
                <>
                    <p className="text-gray-600">₹{Math.round((product.price * weight) / 1000)} / {weight >= 1000 ? (weight/1000) + 'kg' : weight + 'g'}</p>
                    <select
                        value={weight}
                        onChange={e => setWeight(Number(e.target.value))}
                        className="w-20 px-1 py-1 border rounded text-center mt-2"
                    >
                        {weightOptions.map(opt => (
                            <option key={opt} value={opt}>
                                {opt >= 1000 ? (opt/1000) + 'kg' : opt + 'g'}
                            </option>
                        ))}
                    </select>
                </>
            ) : (
                <>
                    <p className="text-gray-600">₹{product.price * qty} / {product.quantity} {qty > 1 ? `(${qty} pcs)` : ''}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <label htmlFor="qty" className="text-sm">Qty:</label>
                        <input
                            id="qty"
                            type="number"
                            min={1}
                            value={qty}
                            onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-12 px-1 py-1 border rounded text-center"
                        />
                    </div>
                </>
            )}
            <button
                onClick={() => {
                    if (isWeightProduct) {
                        // Calculate price for selected weight
                        const price = Math.round((product.price * weight) / 1000);
                        addToCart({ ...product, quantity: weight + 'g', price });
                    } else {
                        addToCart({ ...product, quantity: qty, price: product.price * qty });
                    }
                }}
                className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                Add to Cart
            </button>
        </div>
    );
};

export default ProductCard;
