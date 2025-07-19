import React from 'react';
import axios from 'axios';

function Cart({ cart, user, onRemove, onOrderPlaced }) {
  const total = cart.reduce((acc, item) => acc + item.price, 0);

  const placeOrder = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const orderData = {
      items: cart,
      total: total,
    };

    // 1. Store order in the database
    axios.post('http://localhost:9090/api/orders', orderData)
      .then(res => {
        console.log("Order stored:", res.data);

        // 2. Prepare WhatsApp message
        // Use user info from props
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
    <div className="max-w-xl mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      {cart.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <>
          <table className="w-full text-left border-separate" style={{ borderSpacing: 0 }}>
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-l border-t font-semibold">Product</th>
                <th className="py-2 px-4 border-b border-t font-semibold text-right border-l">Price</th>
                <th className="py-2 px-4 border-b border-r border-t font-semibold text-center"></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, index) => {
                let qty = item.quantity || 1;
                let qtyClass = qty >= 5 ? 'text-xl font-bold text-red-600' : qty >= 2 ? 'text-lg font-semibold text-yellow-600' : 'text-base';
                return (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b border-l flex items-center gap-2">
                      {item.name}
                      <span className={`ml-2 px-2 py-1 rounded bg-gray-100 ${qtyClass}`}>{qty}</span>
                    </td>
                    <td className="py-2 px-4 border-b text-right border-l">₹{item.price}</td>
                    <td className="py-2 px-4 border-b border-r text-center">
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                        onClick={() => onRemove(index)}
                        title="Remove"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
              {/* Total row */}
              <tr>
                <td className="py-2 px-4 font-semibold text-right border-b border-l">Total:</td>
                <td className="py-2 px-4 font-semibold text-right border-b border-l">₹{total}</td>
                <td className="py-2 px-4 border-b border-r"></td>
              </tr>
            </tbody>
          </table>
          {/* Only the table's border-bottom will show, so remove this extra <hr> */}
        </>
      )}
      <div className="flex justify-center">
        <button
          onClick={placeOrder}
          className={`mt-4 px-4 py-2 rounded text-white ${cart.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          disabled={cart.length === 0}
        >
          Place Order on WhatsApp
        </button>
      </div>
    </div>
  );
}

export default Cart;
