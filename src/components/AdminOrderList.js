import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminOrderList = ({ setShowAdmin, setSelectedCategory }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:9090/api/orders/all')
      .then(res => setOrders(res.data))
      .catch(err => console.error('Error fetching all orders:', err));
  }, []);

  // Dummy handler for View button to fix 'handleViewOrder' is not defined error
  const handleViewOrder = (orderId) => {
    alert(`View details for order #${orderId}`);
  };

  return (
    <div className="w-full max-w-sm sm:max-w-2xl mx-auto p-3 sm:p-8 bg-white rounded-2xl shadow-lg border border-gray-100 mt-4">
      <h2 className="text-lg sm:text-2xl font-bold text-purple-700 mb-4 text-center">Admin Orders</h2>
      <div className="flex flex-col gap-4">
        {orders.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No orders found.</div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="border rounded-lg p-3 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{order.customerName}</div>
                <div className="text-gray-600 text-sm">{order.date}</div>
                <div className="text-gray-700 text-base mt-1">Total: ₹{order.total}</div>
              </div>
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition w-full sm:w-auto mt-2 sm:mt-0"
                onClick={() => handleViewOrder(order.id)}
              >
                View
              </button>
            </div>
          ))
        )}
        <button
          type="button"
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg shadow transition mt-2"
          onClick={() => {
            if (setShowAdmin) setShowAdmin(false);
            if (setSelectedCategory) setSelectedCategory("Groceries");
          }}
        >
          Go To Products
        </button>
      </div>
    </div>
  );
};

export default AdminOrderList;