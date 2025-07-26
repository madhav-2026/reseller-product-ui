import React, { useState } from "react";
import AccountModal from "./AccountModal";

export default function ProfileSection({ user, onUpdateUser }) {
  const [showAccount, setShowAccount] = useState(false);

  return (
    <div>
      {/* ...other profile UI... */}
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => setShowAccount(true)}
      >
        Account
      </button>
      {showAccount && (
        <AccountModal
          user={user}
          onClose={() => setShowAccount(false)}
          onSave={onUpdateUser}
        />
      )}
    </div>
  );
}