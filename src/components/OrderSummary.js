import React, { useState, useEffect } from "react";
import axios from "axios";

// Shop coordinates
const SHOP_LAT = 17.544057;
const SHOP_LNG = 78.285794;
const DEST_LAT = 17.558595;
const DEST_LNG = 78.261703;

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

export default function OrderSummary({ cart, onClose, user, setCart }) {
  const [distance, setDistance] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [whatsappOpened, setWhatsappOpened] = useState(false);

  useEffect(() => {
    const dist = getDistanceFromLatLonInKm(
      SHOP_LAT,
      SHOP_LNG,
      DEST_LAT,
      DEST_LNG
    );
    setDistance(dist.toFixed(2));
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const deliveryCharge = distance > 3 ? 20 : 0;
  const grandTotal = total + deliveryCharge;

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    try {
      const orderData = {
        customerPhone: user?.phone || "",
        customerName: user?.name || "",
        date: new Date().toISOString(),
        items: cart,
        total: grandTotal,
        deliveryCharge, // Save delivery charge in order
        status: "Pending",
      };

      await axios.post("http://localhost:9090/api/orders/place", orderData);

      if (setCart) setCart([]);
      localStorage.removeItem("cart");

      setWhatsappOpened(true);

      window.open(
        `https://wa.me/?text=Order%20Details:%0A${cart
          .map(
            (item) =>
              `${item.name} x ${item.quantity} = ₹${item.price}`
          )
          .join("%0A")}%0ATotal: ₹${total}%0ADelivery: ₹${deliveryCharge}%0ADistance: ${distance} km%0AGrand Total: ₹${grandTotal}`,
        "_blank"
      );
    } catch (err) {
      alert("Order could not be saved. Please try again.");
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
          <div className="flex gap-4 mt-4">
            <button
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 disabled:opacity-50"
              onClick={handlePlaceOrder}
              disabled={placingOrder}
            >
              {placingOrder ? "Placing Order..." : "Place Order on WhatsApp"}
            </button>
            <button
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold shadow hover:bg-gray-400"
              onClick={onClose}
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