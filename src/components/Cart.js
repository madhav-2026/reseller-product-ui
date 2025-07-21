import React from "react";

function Cart({ cart, setCart, user, onRemove, onOrderPlaced, setShowCart, setShowOrderSummary, setSelectedCategory }) {
  const total = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="w-full max-w-sm sm:max-w-2xl mx-auto p-4 sm:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 shadow-2xl rounded-3xl border border-blue-200">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
            <circle cx="7" cy="21" r="2" />
            <circle cx="17" cy="21" r="2" />
          </svg>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-700">Your Cart</h2>
        </div>
        {cart.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={() => setCart([])}
              className="px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs shadow transition"
            >
              Remove All
            </button>
          </div>
        )}
      </div>
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
            alt="Empty cart"
            className="w-24 h-24 mb-4 opacity-60"
          />
          <p className="text-lg text-gray-500 mb-4">Your cart is empty.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg shadow-inner bg-white/80">
            <table className="w-full text-left border-separate rounded-lg text-xs sm:text-base" style={{ borderSpacing: 0 }}>
              <thead>
                <tr className="bg-blue-100">
                  <th className="py-3 px-2 sm:px-4 border-b border-l border-t font-semibold text-blue-700">Product</th>
                  <th className="py-3 px-2 sm:px-4 border-b border-t font-semibold text-right border-l text-blue-700">Price</th>
                  <th className="py-3 px-2 sm:px-4 border-b border-r border-t font-semibold text-center"></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => {
                  let qty = item.quantity || 1;
                  let unit = "";
                  let qtyDisplay = qty;

                  if (item.unit) {
                    const unitLower = item.unit.toLowerCase();
                    // For oil products, always show "l"
                    if (item.name && item.name.toLowerCase().includes("oil")) {
                      unit = "l";
                      qtyDisplay = qty;
                    } else if (unitLower.includes("kg") || unitLower.includes("g")) {
                      if (qty >= 1000) {
                        unit = "kg";
                        qtyDisplay = qty / 1000;
                      } else {
                        unit = "g";
                        qtyDisplay = qty;
                      }
                    } else if (unitLower.includes("l")) {
                      unit = "l";
                      qtyDisplay = qty;
                    } else if (unitLower.includes("ml")) {
                      unit = "ml";
                      qtyDisplay = qty;
                    } else {
                      // Default to g if unknown unit
                      unit = "g";
                      qtyDisplay = qty;
                    }
                  } else {
                    // If no unit, check for oil in name, else default to g
                    if (item.name && item.name.toLowerCase().includes("oil")) {
                      unit = "l";
                      qtyDisplay = qty;
                    } else {
                      unit = "g";
                      qtyDisplay = qty;
                    }
                  }

                  return (
                    <tr key={index} className="hover:bg-blue-50 transition">
                      <td className="py-3 px-2 sm:px-4 border-b border-l flex items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                        <span className="ml-2 px-2 py-1 rounded bg-blue-100 text-base text-gray-700 whitespace-nowrap">
                          {`${qtyDisplay}${unit}`}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4 border-b text-right border-l font-semibold text-blue-800">₹{item.price}</td>
                      <td className="py-3 px-2 sm:px-4 border-b border-r text-center align-middle">
                        <div className="flex justify-end">
                          <button
                            className="px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs shadow transition"
                            onClick={() => onRemove(index)}
                            title="Remove"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td className="py-3 px-2 sm:px-4 border-b border-l"></td>
                  <td className="py-3 px-2 sm:px-4 border-b text-right border-l font-bold text-blue-900 text-lg">
                    Total: ₹{total}
                  </td>
                  <td className="py-3 px-2 sm:px-4 border-b border-r"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
      <div className="flex flex-col items-center justify-center gap-2 mt-8">
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 w-full">
          <button
            onClick={() => {
              setShowOrderSummary(true); // Show Order Summary screen
              setShowCart(false);        // Hide Cart screen
            }}
            className="w-full sm:w-auto px-4 sm:px-6 py-3 rounded-lg text-white text-base sm:text-lg font-semibold shadow transition bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700"
          >
            Order Summary
          </button>
          <button
            onClick={() => setShowCart(false)}
            className="w-full sm:w-auto px-4 sm:px-6 py-3 rounded-lg text-white text-base sm:text-lg font-semibold shadow transition bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 mt-2 sm:mt-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
