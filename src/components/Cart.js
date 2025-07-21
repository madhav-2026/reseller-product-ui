import React from 'react';
import axios from 'axios';

function Cart({ cart, setCart, user, onRemove, onOrderPlaced, setShowCart, setSelectedCategory }) {
  const total = cart.reduce((acc, item) => acc + item.price, 0);

  const placeOrder = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const orderData = {
      userPhone: user?.phone || '',
      items: cart,
      total: cart.reduce((acc, item) => acc + item.price, 0),
    };

    axios.post('http://localhost:9090/api/orders/place', orderData)
      .then(res => {
        console.log("Order stored:", res.data);

        // 2. Prepare WhatsApp message
        const customerName = user?.name || user?.firstName || '';
        const customerAddress = user?.address || '';
        const customerPhone = user?.phone || '';
        const messageText =
          `Dear ${customerName},\nThank You For Your Order:)\n\n` +
          `Please Find Your Order Details Below:\n\n` +
          cart.map((p) => `${p.name} (${p.quantity || 1}) - ₹${p.price}`).join('\n') +
          `\n\nTotal: ₹${total}\n\n` +
          `Delivery Address:${customerAddress ? '\n' + customerAddress : ''}\nPhone: ${customerPhone}\nGoogle Map Location: [Paste your location link here]`;
        const message = encodeURIComponent(messageText);

        const phone = '919182455214'; // Replace with your WhatsApp number
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        if (onOrderPlaced) onOrderPlaced();
      })
      .catch(err => {
        console.error("Order failed:", err);
        alert("Failed to place order. Please try again.");
      });
  };

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
                  let qtyClass = qty >= 5 ? 'text-xl font-bold text-red-600' : qty >= 2 ? 'text-lg font-semibold text-yellow-600' : 'text-base';
                  return (
                    <tr key={index} className="hover:bg-blue-50 transition">
                      <td className="py-3 px-2 sm:px-4 border-b border-l flex items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                        <span className={`ml-2 px-2 py-1 rounded bg-blue-100 ${qtyClass}`}>{qty}</span>
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
          <div className="mb-2 text-center text-blue-700 font-medium bg-blue-50 rounded px-2 sm:px-4 py-2 shadow mt-4">
            Currently accepting orders on WhatsApp and UPI/COD payment at the time of order delivery.
          </div>
        </>
      )}
      <div className="flex flex-col items-center justify-center gap-2 mt-8">
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 w-full">
          <button
            onClick={placeOrder}
            className={`w-full sm:w-auto px-4 sm:px-6 py-3 rounded-lg text-white text-base sm:text-lg font-semibold shadow transition ${
              cart.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800'
            }`}
            disabled={cart.length === 0}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp"
              className="inline-block w-6 h-6 mr-2 align-middle"
              style={{ verticalAlign: 'middle', display: 'inline' }}
            />
            Place Order On WhatsApp
          </button>
          <button
            onClick={() => {
              if (setShowCart) setShowCart(false);
              if (setSelectedCategory) setSelectedCategory("Groceries");
            }}
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
