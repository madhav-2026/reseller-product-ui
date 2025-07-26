import React from "react";

export default function AccountModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Account Details</h2>
        <div className="mb-3">
          <label className="block text-gray-700 mb-1">Name</label>
          <input
            className="w-full border rounded p-2"
            value={user?.name || ""}
            disabled
          />
        </div>
        <div className="mb-3">
          <label className="block text-gray-700 mb-1">Phone</label>
          <input
            className="w-full border rounded p-2"
            value={user?.phone || ""}
            disabled
          />
        </div>
        {/* Add more fields if needed */}
        <div className="flex gap-2 mt-4 justify-end">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}