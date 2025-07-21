import React, { useState, useEffect } from 'react';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import AdminAddProduct from './components/AdminAddProduct';
import OrderHistory from './components/OrderHistory';
import LoginForm from './components/LoginForm';
import AdminOrderList from './components/AdminOrderList';
import LocationDistance from './components/LocationDistance';

const categories = [
  "Groceries",
  "Electronics",
  "Clothing",
  "Books",
  "Accessories"
];

function App() {
  const [cart, setCart] = useState(() => {
    // Try to load cart from localStorage on first render
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [showCart, setShowCart] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // { name, address, ... }
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Groceries"); // Set default to "Groceries"
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshProducts, setRefreshProducts] = useState(true); // Set to true to trigger initial load
  const [profileOpen, setProfileOpen] = useState(false);
  const [, setDeliveryDistance] = useState(null);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // On login success, save user to sessionStorage
  const handleLoginSuccess = (userInfo) => {
    setIsLoggedIn(true);
    setUser(userInfo);
    sessionStorage.setItem('user', JSON.stringify(userInfo)); // <-- changed to sessionStorage
    setSelectedCategory("Groceries");
    setRefreshProducts(prev => !prev);
  };

  // On logout, remove user from sessionStorage
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    sessionStorage.removeItem('user'); // <-- changed to sessionStorage
    setShowCart(false);
    setShowAdmin(false);
    setShowOrderHistory(false);
  };

  // On app load, check sessionStorage for user
  useEffect(() => {
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    setShowCart(false);
    setShowAdmin(false);
    setShowOrderHistory(false);
    setOrderSuccess(false);
  };

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      {/* Sidebar */}
      <aside className="w-60 bg-white/80 border-r border-purple-200 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg mr-3">
              <span className="text-white text-2xl font-extrabold">ATO</span>
            </div>
            <div className="text-purple-700 font-semibold text-lg">
              Welcome {user?.name || user?.firstName || "Customer"}
            </div>
          </div>
          <div>
            <div className="font-bold text-gray-700 mb-2">Categories</div>
            <ul className="space-y-2">
              {categories.map(cat => (
                <li key={cat}>
                  <button
                    className={`w-full text-left px-3 py-2 rounded transition ${
                      selectedCategory === cat
                        ? "bg-purple-200 text-purple-900 font-semibold"
                        : "hover:bg-purple-100 text-gray-700"
                    }`}
                    onClick={() => handleCategoryClick(cat)}
                    disabled={cat !== "Groceries"}
                    style={cat !== "Groceries" ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Logout button removed from sidebar */}
      </aside>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="p-4 bg-blue-100 flex items-center justify-between shadow-md border-b border-blue-200 rounded-b-2xl transition-all duration-300">
          {/* Show location distance at the top right */}
          <LocationDistance setDeliveryDistance={setDeliveryDistance} />
          {/* Left: Navigation */}
          <div className="flex gap-2 md:gap-4">
            {/* Admin buttons removed from here */}
          </div>
          {/* Center: Search Bar */}
          <div className="flex-1 flex justify-center">
            <input
              type="text"
              className="w-full max-w-xs px-4 py-2 border-0 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-blue-700 placeholder-blue-400 transition"
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Right: Cart and Profile */}
          <div className="flex items-center gap-4">
            {user && user.phone !== "+918074689114" && (
              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-200 text-blue-800 rounded-lg shadow hover:bg-blue-300 font-semibold transition"
                onClick={() => {
                  setShowCart(true);
                  setShowAdmin(false);
                  setShowOrderHistory(false);
                  setOrderSuccess(false);
                }}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1170/1170678.png"
                  alt="Cart"
                  className="w-6 h-6"
                />
                Cart <span className="ml-1">({cart.length})</span>
              </button>
            )}
            {/* Profile/Settings */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 bg-blue-200 text-blue-800 rounded-full shadow hover:bg-blue-300 font-semibold transition"
                tabIndex={0}
                onClick={() => setProfileOpen((open) => !open)}
                onBlur={() => setTimeout(() => setProfileOpen(false), 150)} // closes on blur
              >
                <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="7" r="4" />
                  <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
                </svg>
                <span className="md:inline">{user?.name || user?.firstName || "Profile"}</span>
                <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-700"
                    onClick={() => {
                      alert('Account page coming soon!');
                      setProfileOpen(false);
                    }}
                  >
                    Account
                  </button>
                  {/* Show "Your Orders" only for non-admin users */}
                  {user && user.phone !== "+918074689114" && (
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-700"
                      onClick={() => {
                        setShowOrderHistory(true);
                        setShowCart(false);
                        setShowAdmin(false);
                        setOrderSuccess(false);
                        setProfileOpen(false);
                      }}
                    >
                      Your Orders
                    </button>
                  )}
                  {/* Admin links in profile dropdown */}
                  {user && user.phone === "+918074689114" && (
                    <>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-700"
                        onClick={() => {
                          setShowAdmin("orders");
                          setShowCart(false);
                          setShowOrderHistory(false);
                          setOrderSuccess(false);
                          setProfileOpen(false);
                        }}
                      >
                        Admin Orders
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-700"
                        onClick={() => {
                          setShowAdmin(true);
                          setShowCart(false);
                          setShowOrderHistory(false);
                          setProfileOpen(false);
                        }}
                      >
                        Admin Add Product
                      </button>
                    </>
                  )}
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 text-red-600"
                    onClick={() => {
                      handleLogout();
                      setProfileOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
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
                  <OrderHistory
                    user={user}
                    setShowOrderHistory={setShowOrderHistory}
                    setSelectedCategory={setSelectedCategory}
                  />
                ) : showAdmin === "orders" ? (
                  <AdminOrderList
                    setShowAdmin={setShowAdmin}
                    setSelectedCategory={setSelectedCategory}
                  />
                ) : showAdmin ? (
                  <AdminAddProduct setShowAdmin={setShowAdmin} setSelectedCategory={setSelectedCategory} />
                ) : showCart ? (
                  <Cart
                    cart={cart}
                    setCart={setCart} // <-- Add this line!
                    user={user}
                    onRemove={(removeIndex) => {
                      setCart(cart => cart.filter((_, idx) => idx !== removeIndex));
                    }}
                    onOrderPlaced={() => {
                      setOrderSuccess(true);
                      setCart([]);
                    }}
                    setShowCart={setShowCart}
                    setSelectedCategory={setSelectedCategory}
                  />
                ) : (
                  // Always show all products by default when logged in, filtered by search
                  <ProductList
                    cart={cart}
                    setCart={setCart}
                    selectedCategory={selectedCategory}
                    searchTerm={searchTerm}
                    refreshProducts={refreshProducts}
                    user={user}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
