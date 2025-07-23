import React, { useState } from 'react';
import ImageGalleryModal from './ImageGalleryModal';

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

    // Modal state for image gallery
    const [showGallery, setShowGallery] = useState(false);

    // Prepare images array for gallery
    let images = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
        images = product.images.map(img =>
            img.startsWith('http') ? img : `http://localhost:9090/${img}`
        );
    } else if (product.image) {
        images = [`http://localhost:9090/${product.image}`];
    } else {
        images = ["https://placehold.co/120x120?text=No+Image"];
    }

    return (
        <div className="bg-white rounded-lg shadow p-2 flex flex-col items-center w-36 min-w-0 mx-auto my-2 relative">
            {/* Quantity dropdown/input above the image */}
            <div className="w-full flex items-center justify-start mb-1">
                {isWeightProduct ? (
                    <select
                        id="weight"
                        value={weight}
                        onChange={e => setWeight(Number(e.target.value))}
                        className="w-16 px-1 py-0.5 border rounded text-[10px] bg-white bg-opacity-90"
                    >
                        {weightOptions.map(opt => (
                            <option key={opt} value={opt}>
                                {opt >= 1000 ? (opt/1000) + 'kg' : opt + 'g'}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        id="qty"
                        type="number"
                        min={1}
                        value={qty}
                        onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-12 px-1 py-0.5 border rounded text-[10px] bg-white bg-opacity-90 text-center"
                    />
                )}
                {/* Price beside quantity */}
                <span className="ml-2 bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded shadow">
                    ₹{isWeightProduct
                        ? Math.round((product.price * weight) / 1000)
                        : product.price * qty}
                </span>
            </div>
            <div className="relative w-full flex justify-center">
                <img
                    src={images[0]}
                    alt={product.name}
                    className="w-20 h-20 object-contain mb-2 rounded cursor-pointer"
                    onError={e => { e.target.src = "https://placehold.co/120x120?text=No+Image"; }}
                    onClick={() => setShowGallery(true)}
                />
                {/* Removed the price at top right of image */}
            </div>
            {/* Product name and Add button below the image */}
            <div className="mt-1 mb-1 w-full flex items-center justify-between">
                <span className="inline-block bg-yellow-300 text-blue-900 text-xs font-bold px-2 py-1 rounded">
                    {product.name}
                </span>
                {user && user.phone !== "+918074689114" && (
                    <button
                        className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded shadow hover:bg-blue-600 transition"
                        onClick={() => addToCart(product)}
                    >
                        Add
                    </button>
                )}
            </div>
            {showGallery && (
                <ImageGalleryModal
                    images={images}
                    onClose={() => setShowGallery(false)}
                />
            )}
        </div>
    );
};

export default ProductCard;
