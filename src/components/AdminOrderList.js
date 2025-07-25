import React, { useEffect, useState } from 'react';
import axios from 'axios';

const statusOptions = ["Pending", "Completed", "Cancelled"];

const AdminOrderList = ({ setShowAdmin, setSelectedCategory }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:9090/api/orders/all')
      .then(res => setOrders(res.data))
      .catch(err => console.error('Error fetching all orders:', err));
  }, []);

  const handleViewOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId || o._id === orderId);
    setSelectedOrder(order);
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setUpdatingStatus(true);
    try {
      await axios.patch(`http://localhost:9090/api/orders/status/${selectedOrder.id || selectedOrder._id}`, {
        status: newStatus,
      });
      setOrders(orders.map(order =>
        (order.id === selectedOrder.id || order._id === selectedOrder._id)
          ? { ...order, status: newStatus }
          : order
      ));
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    } catch (err) {
      alert("Failed to update status");
    }
    setUpdatingStatus(false);
  };

  return (
    <div className="w-full max-w-sm sm:max-w-2xl mx-auto p-3 sm:p-8 bg-white rounded-2xl shadow-lg border border-gray-100 mt-4">
      <h2 className="text-lg sm:text-2xl font-bold text-purple-700 mb-4 text-center">Admin Orders</h2>
      <div className="flex flex-col gap-4">
        {selectedOrder ? (
          <div className="border rounded-lg p-3">
            <div className="flex items-center mb-2 justify-between">
              <div>
                <span className="font-semibold text-gray-800">Ordered On:</span>
                <span className="ml-2 text-gray-600 text-sm">{selectedOrder.date}</span>
              </div>
              <div>
                <span className="font-semibold text-sm text-gray-600">Status: </span>
                <select
                  className="ml-2 px-2 py-1 border rounded"
                  value={selectedOrder.status}
                  onChange={handleStatusChange}
                  disabled={updatingStatus || selectedOrder.status === "Completed" || selectedOrder.status === "Cancelled"}
                >
                  {statusOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <table className="w-full border border-gray-400">
                <thead>
                  <tr className="font-semibold border-b border-gray-500">
                    <th className="py-2 text-center border-r border-gray-400">Product</th>
                    <th className="py-2 text-center border-r border-gray-400">Quantity</th>
                    <th className="py-2 text-center">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-400">
                      <td className="py-2 text-center border-r border-gray-300">{item.name}</td>
                      <td className="py-2 text-center text-gray-600 text-sm border-r border-gray-300">{item.quantity}</td>
                      <td className="py-2 text-center font-bold text-green-700">{`₹${item.price}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mb-2 font-semibold">
              <span className="text-orange-700">Delivery Charges:</span>
              <span className="ml-2 font-bold text-orange-600">
                ₹{selectedOrder.deliveryCharge > 0
                  ? selectedOrder.deliveryCharge
                  : "Free"}
              </span>
            </div>
            <div className="mt-4 font-bold text-blue-700 text-lg">
              Grand Total (including charges): ₹{selectedOrder.total}
            </div>
            <button
              className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold shadow"
              onClick={() => setSelectedOrder(null)}
            >
              Back to Orders
            </button>
          </div>
        ) : (
          orders.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No orders found.</div>
          ) : (
            orders.map(order => (
              <div key={order.id || order._id} className="border rounded-lg p-3 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <div className="flex-1">
                  <div className="mb-1">
                    <span className="font-semibold text-gray-800">Ordered On:</span>
                    <span className="ml-2 text-gray-600 text-sm">{order.date || "N/A"}</span>
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold text-gray-800">Customer Number:</span>
                    <span className="ml-2 text-gray-600 text-sm">{order.customerPhone || "N/A"}</span>
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold text-gray-800">Customer Name:</span>
                    <span className="ml-2 text-gray-600 text-sm">{order.customerName || "N/A"}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="mb-2">
                    <span className="font-semibold text-sm text-gray-600">Status: </span>
                    <span
                      className={
                        order.status === "Pending"
                          ? "text-yellow-600 font-semibold"
                          : order.status === "Completed"
                          ? "text-green-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {order.status}
                    </span>
                  </div>
                  <button
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition w-full sm:w-auto"
                    onClick={() => handleViewOrder(order.id || order._id)}
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          )
        )}
        {!selectedOrder && (
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
        )}
      </div>
    </div>
  );
};

export default AdminOrderList;