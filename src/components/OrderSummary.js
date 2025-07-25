import React, { useState, useEffect } from "react";
import axios from "axios";

// Shop coordinates
const SHOP_LAT = 17.544057;
const SHOP_LNG = 78.285794;

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function OrderSummary({ cart, onClose, user, setCart, setShowAddAddress }) {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [distance, setDistance] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [whatsappOpened, setWhatsappOpened] = useState(false);

  useEffect(() => {
    if (user?.phone) {
      axios
        .get(`http://localhost:9090/api/customer/${user.phone}`)
        .then((res) => setAddresses(res.data.addresses || [])) // <-- always fallback to []
        .catch(() => setAddresses([]));
    }
  }, [user]);

  useEffect(() => {
    if (selectedAddress && selectedAddress.lat && selectedAddress.lng) {
      const dist = getDistanceFromLatLonInKm(
        SHOP_LAT,
        SHOP_LNG,
        selectedAddress.lat,
        selectedAddress.lng
      );
      setDistance(dist.toFixed(2));
    } else {
      setDistance(null);
    }
  }, [selectedAddress]);

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const deliveryCharge = distance > 3 ? 20 : 0;
  const grandTotal = total + deliveryCharge;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Please select a delivery address.");
      return;
    }
    if (!cart || cart.length === 0) {
      alert("Please add products to your cart.");
      return;
    }
    setPlacingOrder(true);
    try {
      // Save order first
      const orderData = {
        customerPhone: user?.phone || "",
        customerName: user?.name || "",
        date: new Date().toISOString(),
        items: cart,
        total: grandTotal,
        deliveryCharge,
        status: "Pending",
        latitude: selectedAddress?.lat || null,
        longitude: selectedAddress?.lng || null,
        address: selectedAddress?.address || "",
      };
      await axios.post("http://localhost:9090/api/orders/place", orderData);

      // Create Razorpay order for payment
      const paymentRes = await axios.post("http://localhost:9090/api/payment/create-order", { amount: grandTotal });
      const razorpayOrder = paymentRes.data;

      const options = {
        key: "rzp_test_bmXXAclygUWgTk",
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "ATO",
        description: "Order Payment",
        order_id: razorpayOrder.id,
        handler: async function (response) {
          await axios.post("http://localhost:9090/api/payment/save-payment", {
            paymentId: response.razorpay_payment_id,
            razorpayOrderId: razorpayOrder.id,
            status: "Completed"
          });
          if (setCart) setCart([]);
          localStorage.removeItem("cart");
          setWhatsappOpened(true);
          alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Order or payment could not be processed. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="w-full max-w-sm sm:max-w-2xl mx-auto p-4 sm:p-8 bg-white shadow-2xl rounded-3xl border border-blue-200">
      {whatsappOpened ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-green-700 text-xl font-bold mb-4">
            Please complete your order in WhatsApp.<br />
            Once done, click below to continue shopping.
          </div>
          <button
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold shadow hover:bg-purple-700 transition"
            onClick={() => {
              setWhatsappOpened(false);
              onClose();
            }}
          >
            Buy Again
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-4 text-blue-700">Order Summary</h2>
          <table className="w-full mb-4">
            <thead>
              <tr>
                <th className="text-left">Product</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">₹{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mb-2 flex justify-between">
            <span>Total Amount:</span>
            <span>₹{total}</span>
          </div>
          <div className="mb-2 flex justify-between">
            <span>Delivery Charges:</span>
            <span className="text-right">
              {distance && deliveryCharge > 0 && (
                <span className="text-xs text-gray-600 mr-2">
                  (Distance from source to your location is {distance} km, so delivery charges applied)
                </span>
              )}
              {deliveryCharge > 0 ? `₹${deliveryCharge}` : "Free"}
            </span>
          </div>
          <div className="mb-4 flex justify-between font-bold text-blue-700">
            <span>Grand Total:</span>
            <span>₹{grandTotal}</span>
          </div>
          <div className="mb-4">
            <label className="font-semibold text-gray-700 mb-2 block">Select Delivery Address:</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedAddress ? String(selectedAddress._id) : ""}
              onChange={e => {
                const addr = addresses.find(a => String(a._id) === e.target.value);
                setSelectedAddress(addr || null);
              }}
            >
              <option value="">-- Select Address --</option>
              {(addresses || []).map(addr => (
                <option key={addr._id} value={String(addr._id)}>
                  {addr.address}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-4 mt-4">
            {cart && Array.isArray(cart) && cart.length > 0 ? (
              <button
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 disabled:opacity-50"
                onClick={handlePlaceOrder}
                disabled={placingOrder}
              >
                {placingOrder ? "Placing Order..." : "Place Order"}
              </button>
            ) : (
              <button
                className="flex-1 px-4 py-2 bg-green-400 text-white rounded-lg font-semibold shadow opacity-50 cursor-not-allowed"
                disabled
              >
                Place Order
              </button>
            )}
            <button
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold shadow hover:bg-gray-400"
              onClick={() => {
                if (setShowAddAddress) setShowAddAddress(false);
                if (onClose) onClose();
                // If you have setShowCart in props, call it to show the cart screen
                if (typeof setCart === "function") {
                  // Optionally, you can pass a callback to show cart in your parent component
                  // For example: setShowCart(true);
                }
              }}
            >
              Back to Cart
            </button>
          </div>
          <div className="mb-2 text-center text-blue-700 font-medium bg-blue-50 rounded px-2 sm:px-4 py-2 shadow mt-4">
            Currently accepting orders on WhatsApp and UPI/COD payment at the time of
            order delivery.
          </div>
        </>
      )}
    </div>
  );
}