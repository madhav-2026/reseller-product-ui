import React, { useState } from 'react';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import AdminAddProduct from './components/AdminAddProduct';
import OrderHistory from './components/OrderHistory';
import LoginForm from './components/LoginForm';

function App() {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // { name, address, ... }
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Accept user info from LoginForm
  const handleLoginSuccess = (userInfo) => {
    setIsLoggedIn(true);
    setUser(userInfo); // Always store user info after login
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCart([]);
    setShowCart(false);
    setShowAdmin(false);
    setShowOrderHistory(false);
  };

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      {/* Header */}
      <header className="p-4 bg-white flex items-center justify-between shadow-md border-b border-gray-100">
        <div className="flex flex-col items-center mr-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-lg font-extrabold">ATO</span>
          </div>
          <span className="text-xs font-bold text-gray-700 mt-1">Any Time Order</span>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex gap-2 md:gap-4">
            <button
              className="px-4 py-2 bg-gray-100 rounded shadow hover:bg-gray-200 font-semibold"
              onClick={() => {
                setShowCart(false);
                setShowAdmin(false);
                setShowOrderHistory(false);
              }}
            >
              Products
            </button>
            <button
              className="px-4 py-2 bg-gray-100 rounded shadow hover:bg-gray-200 font-semibold"
              onClick={() => {
                setShowCart(true);
                setShowAdmin(false);
                setShowOrderHistory(false);
              }}
            >
              Cart 🛒 ({cart.length})
            </button>
            <button
              className="px-4 py-2 bg-gray-100 rounded shadow hover:bg-gray-200 font-semibold"
              onClick={() => {
                setShowAdmin(true);
                setShowCart(false);
                setShowOrderHistory(false);
              }}
            >
              Admin Add Product
            </button>
            <button
              className="px-4 py-2 bg-gray-100 rounded shadow hover:bg-gray-200 font-semibold"
              onClick={() => {
                setShowOrderHistory(true);
                setShowCart(false);
                setShowAdmin(false);
              }}
            >
              Order History
            </button>
          </div>
        </div>
        <button
          className="ml-4 px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 font-semibold"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="p-4 flex justify-center">
        <div className="w-full max-w-3xl">
          {orderSuccess ? (
            <div className="flex flex-col items-center justify-center mt-8">
              <div className="font-bold text-xl text-green-700 text-center w-full mb-2">
                Your order has been placed successfully!
              </div>
              <button
                className="px-8 py-3 bg-green-600 text-white rounded hover:bg-green-700 font-semibold shadow text-lg"
                onClick={() => {
                  setOrderSuccess(false);
                  setShowCart(false);
                  setShowAdmin(false);
                  setShowOrderHistory(false);
                }}
              >
                Order Again
              </button>
            </div>
          ) : (
            <>
              {showOrderHistory ? (
                <OrderHistory />
              ) : showAdmin ? (
                <AdminAddProduct />
              ) : showCart ? (
                <Cart
                  cart={cart}
                  user={user}
                  onRemove={(removeIndex) => {
                    setCart(cart => cart.filter((_, idx) => idx !== removeIndex));
                  }}
                  onOrderPlaced={() => {
                    setOrderSuccess(true);
                    setCart([]);
                  }}
                />
              ) : (
                <ProductList cart={cart} setCart={setCart} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
