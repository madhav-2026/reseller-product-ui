import React, { useEffect, useState } from 'react';
import axios from 'axios';

const STATUS_OPTIONS = ["Pending", "Completed", "Failed"];

const AdminOrderList = ({ setShowAdmin, setSelectedCategory }) => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("Pending");

  useEffect(() => {
    axios.get('http://localhost:9090/api/orders/all')
      .then(res => setOrders(res.data))
      .catch(err => console.error('Error fetching all orders:', err));
  }, []);

  // Filter and sort orders by status and latest date
  const filteredOrders = orders
    .filter(order => filterStatus === "All" ? true : (order.status || "Pending") === filterStatus)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const updateStatus = (orderId, status) => {
    axios.patch(`http://localhost:9090/api/orders/${orderId}/status`, { status })
      .then(res => {
        setOrders(orders =>
          orders.map(order =>
            order.id === orderId ? { ...order, status } : order
          )
        );
      })
      .catch(err => alert('Failed to update status'));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">All Orders (Admin)</h2>
      <div className="mb-4">
        <label className="font-semibold mr-2">Filter by Status:</label>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border rounded px-2 py-1"
        >
          {STATUS_OPTIONS.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
          <option value="All">All</option>
        </select>
      </div>
      {filteredOrders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        <>
          {filteredOrders.map(order => (
            <div key={order.id} className="mb-6 p-4 border rounded shadow bg-white">
              <div className="font-semibold mb-2">
                Date: {order.date ? new Date(order.date).toLocaleString() : "N/A"}
              </div>
              <div>Customer: {order.userPhone}</div>
              <div>
                Items:
                {order.items && order.items.length > 0
                  ? order.items.map(item => (
                      <div key={item._id || item.name} className="flex justify-between">
                        <span>{item.name} x {item.quantity}</span>
                        <span className="ml-2 text-gray-600">₹{item.price}</span>
                      </div>
                    ))
                  : "No items"}
              </div>
              <div className="flex justify-end font-bold mt-2">
                Total: ₹{order.total}
              </div>
              <div className="mt-1 flex items-center">
                <span className="font-semibold">Status:</span>
                <span className="ml-2">{order.status ? order.status : "Pending"}</span>
                {order.status !== "Completed" && (
                  <button
                    className="ml-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={() => updateStatus(order.id, "Completed")}
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className="flex justify-end mt-8">
            <button
              className="px-6 py-3 rounded-lg text-white text-lg font-semibold shadow transition bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700"
              onClick={() => {
                if (setShowAdmin) setShowAdmin(false);
                if (setSelectedCategory) setSelectedCategory("Groceries");
              }}
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminOrderList;