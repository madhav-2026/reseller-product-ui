import React, { useEffect, useState } from 'react';
import axios from 'axios';

const statusColors = {
  Pending: "bg-yellow-200 text-yellow-900 border-yellow-400",
  Completed: "bg-green-200 text-green-900 border-green-400",
  Failed: "bg-red-200 text-red-900 border-red-400",
};

const OrderHistory = ({ user, setShowOrderHistory, setSelectedCategory }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user || !user.phone) return;
    axios.get(`http://localhost:9090/api/orders/history/${user.phone}`)
      .then(response => {
        setOrders(response.data);
      })
      .catch(error => {
        console.error('Error fetching order history:', error);
      });
  }, [user]);

  if (!user || !user.phone) {
    return <div className="p-4">Please log in to view your order history.</div>;
  }

  return (
    <div className="w-full max-w-sm sm:max-w-2xl mx-auto p-4 sm:p-8 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 min-h-screen rounded-2xl shadow-xl">
      <h2 className="text-2xl sm:text-3xl mb-8 text-blue-700 flex items-center gap-3 drop-shadow">
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4M4 11h16" /></svg>
        Order History
      </h2>
      {orders && orders.length > 0 ? (
        orders.map((order, idx) => (
          <div
            key={idx}
            className={`mb-8 p-4 sm:p-6 border-2 rounded-2xl shadow-xl bg-white/80 hover:bg-white transition-all duration-200 ${statusColors[order.status] || statusColors.Pending}`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
              <div className="font-semibold text-gray-700">
                <span className="mr-2">Order Date:</span>
                <span className="text-gray-900">{order.date ? new Date(order.date).toLocaleString() : "N/A"}</span>
              </div>
              <span className={`px-4 py-1 rounded-full text-base font-bold border ${statusColors[order.status] || statusColors.Pending}`}>
                {order.status ? order.status : "Pending"}
              </span>
            </div>
            <div className="mb-3">
              <div className="font-semibold text-gray-700 mb-1">Items:</div>
              <div className="space-y-2">
                {order.items && order.items.length > 0
                  ? order.items.map(item => (
                      <div key={item._id || item.name} className="flex justify-between items-center bg-purple-50 rounded px-2 sm:px-4 py-2 shadow-sm">
                        <span className="text-gray-900 font-medium">
                          {item.name} <span className="text-xs text-gray-500">x {item.quantity}</span>
                        </span>
                        <span className="text-purple-700 font-bold">₹{item.price}</span>
                      </div>
                    ))
                  : <span className="text-gray-400">No items</span>}
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <span className="text-lg sm:text-xl text-blue-700 drop-shadow">
                Total: ₹{order.total}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-500 text-center mt-8">No orders found.</div>
      )}
      {/* Close Button at the end */}
      <div className="flex flex-col sm:flex-row justify-end mt-8 gap-2">
        <button
          onClick={() => {
            if (setShowOrderHistory) setShowOrderHistory(false);
            if (setSelectedCategory) setSelectedCategory("Groceries");
          }}
          className="w-full sm:w-auto px-4 sm:px-6 py-3 rounded-lg text-white text-base sm:text-lg font-semibold shadow transition bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default OrderHistory;
