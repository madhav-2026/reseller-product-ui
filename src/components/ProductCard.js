import React, { useState } from 'react';

const ProductCard = ({ product, addToCart, user }) => {
    const [qty, setQty] = useState(1);
    const isWeightProduct =
        (product.unit && (product.unit.toLowerCase().includes('kg') || product.unit.toLowerCase().includes('g')))
        || (product.quantity && (product.quantity.toLowerCase().includes('kg') || product.quantity.toLowerCase().includes('g')));

    // Remove duplicates from weightOptions
    const weightOptions = isWeightProduct && Array.isArray(product.weightOptions) && product.weightOptions.length > 0
        ? [...new Set(product.weightOptions)]
        : [500, 1000, 2000];

    // Use function initializer to set weight only once
    const [weight, setWeight] = useState(() => (isWeightProduct ? weightOptions[0] : 1));

    // Responsive image fallback
    const imageSrc = product.image
        ? `http://localhost:9090/${product.image}`
        : "https://placehold.co/120x120?text=No+Image";

    return (
        <div className="w-full max-w-xs sm:max-w-sm bg-white shadow-md rounded-lg p-3 sm:p-4 m-2 flex flex-col items-center transition hover:shadow-xl">
            <img
                src={imageSrc}
                alt={product.name}
                className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded mb-2"
                onError={e => { e.target.src = "https://placehold.co/120x120?text=No+Image"; }}
            />
            <h2 className="mt-2 text-base sm:text-lg font-semibold text-center">{product.name}</h2>
            {isWeightProduct ? (
                <>
                    <p className="text-gray-600 text-sm sm:text-base">
                        ₹{Math.round((product.price * weight) / 1000)} / {weight >= 1000 ? (weight/1000) + 'kg' : weight + 'g'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <label htmlFor="weight" className="text-sm">Qty:</label>
                        <select
                            id="weight"
                            value={weight}
                            onChange={e => setWeight(Number(e.target.value))}
                            className="w-20 px-1 py-1 border rounded text-center"
                        >
                            {weightOptions.map(opt => (
                                <option key={opt} value={opt}>
                                    {opt >= 1000 ? (opt/1000) + 'kg' : opt + 'g'}
                                </option>
                            ))}
                        </select>
                    </div>
                </>
            ) : (
                <>
                    <p className="text-gray-600 text-sm sm:text-base">
                        ₹{product.price * qty} / {product.quantity} {qty > 1 ? `(${qty} pcs)` : ''}
                    </p>
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
            {user && user.phone !== "+918074689114" && (
                <button
                    onClick={() => addToCart(product)}
                    className="mt-3 w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold transition"
                >
                    Add to Cart
                </button>
            )}
        </div>
    );
};

export default ProductCard;
