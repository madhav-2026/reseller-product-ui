import React, { useState, useEffect, useRef } from 'react';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import AdminAddProduct from './components/AdminAddProduct';
import OrderHistory from './components/OrderHistory';
import LoginForm from './components/LoginForm';
import AdminOrderList from './components/AdminOrderList';
import OrderSummary from './components/OrderSummary';
import LocationDistance from './components/LocationDistance';
import AccountModal from './components/AccountModal'; // Add this import at the top

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
  const [selectedCategory, setSelectedCategory] = useState("Groceries"); // Set default to "Groceries"
  const [refreshProducts, setRefreshProducts] = useState(true); // Set to true to trigger initial load
  const [profileOpen, setProfileOpen] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const profileRef = useRef();

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
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
    sessionStorage.removeItem('user');
    setShowCart(false);
    setShowAdmin(false);
    setShowOrderHistory(false);
    setShowOrderSummary(false);
    setProfileOpen(false);
  };

  // On app load, check sessionStorage for user
  useEffect(() => {
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  // This function will be called when user info is updated in AccountModal
  const handleUpdateUser = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
    // Optionally, send updated info to backend here
  };

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="p-4 bg-blue-100 flex flex-col shadow-md border-b border-blue-200 rounded-b-2xl transition-all duration-300 relative">
          {/* Main header content: left-aligned and right-aligned */}
          <div className="flex items-start w-full mb-2">
            <div className="flex flex-col items-start flex-1">
              {/* No ATO here */}
              <LocationDistance user={user} />
            </div>
            {/* Cart and Profile icon at the top right */}
            <div className="flex items-center gap-1">
              {user && user.phone !== "+918074689114" && (
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-blue-200 text-blue-800 rounded-lg shadow hover:bg-blue-300 font-semibold transition disabled:opacity-50"
                  onClick={() => setShowCart(true)}
                  disabled={!cart || cart.length === 0}
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/1170/1170678.png"
                    alt="Cart"
                    className="w-6 h-6"
                  />
                  <span className="ml-0">({cart.length})</span>
                </button>
              )}
              {/* Profile icon and dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  className="flex items-center justify-center w-10 h-10 bg-blue-200 text-blue-800 rounded-full shadow hover:bg-blue-300 font-semibold transition"
                  tabIndex={0}
                  onClick={() => setProfileOpen((open) => !open)}
                  aria-label="Profile"
                >
                  <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="7" r="4" />
                    <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
                  </svg>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-700"
                      onClick={() => {
                        setShowAccountModal(true);
                        setProfileOpen(false);
                      }}
                    >
                      Account
                    </button>
                    {user && user.phone !== "+918074689114" && (
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-700"
                        onClick={() => {
                          setShowOrderHistory(true);
                          setShowCart(false);
                          setShowAdmin(false);
                          setShowOrderSummary(false);
                          setProfileOpen(false);
                        }}
                      >
                        Your Orders
                      </button>
                    )}
                    {user && user.phone === "+918074689114" && (
                      <>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-700"
                          onClick={() => {
                            setShowAdmin("orders");
                            setShowCart(false);
                            setShowOrderHistory(false);
                            setShowOrderSummary(false);
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
                            setShowOrderSummary(false);
                            setProfileOpen(false);
                          }}
                        >
                          Admin Add Product
                        </button>
                      </>
                    )}
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 text-red-600"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 flex justify-center">
          <div className="w-full max-w-3xl">
            {/* Category Buttons */}
            <div className="mb-4 flex flex-wrap gap-2">
              {["Groceries", "Fruits", "Vegetables", "Snacks"].map(cat => (
                <button
                  key={cat}
                  className={`px-4 py-2 rounded border font-semibold transition ${
                    selectedCategory === cat
                      ? "bg-purple-200 text-purple-900 border-purple-400"
                      : "bg-white text-gray-700 border-purple-200 hover:bg-purple-50"
                  }`}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setShowOrderHistory(false);
                    setShowOrderSummary(false);
                    setShowAdmin(false);
                    setShowCart(false);
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* Product List */}
            {showOrderSummary ? (
              <OrderSummary
                cart={cart}
                setCart={setCart}
                onClose={() => {
                  setShowOrderSummary(false);
                  setShowCart(false);
                  setShowOrderHistory(false);
                  setShowAdmin(false);
                }}
                onBackToCart={() => {
                  setShowOrderSummary(false);
                  setShowCart(true);
                }}
                user={user}
              />
            ) : showOrderHistory ? (
              <OrderHistory
                user={user}
                setSelectedCategory={setSelectedCategory} // <-- Make sure this is present
                setShowOrderHistory={setShowOrderHistory}
              />
            ) : showAdmin === "orders" ? (
              <AdminOrderList
                setShowAdmin={setShowAdmin}
                setSelectedCategory={setSelectedCategory}
              />
            ) : showAdmin === true ? (
              <AdminAddProduct
                setShowAdmin={setShowAdmin}
                setSelectedCategory={setSelectedCategory}
              />
            ) : showCart ? (
              <Cart
                cart={cart}
                setCart={setCart}
                user={user}
                onRemove={(removeIndex) => {
                  setCart(cart => cart.filter((_, idx) => idx !== removeIndex));
                }}
                setShowCart={setShowCart}
                setShowOrderSummary={setShowOrderSummary}
                setSelectedCategory={setSelectedCategory}
              />
            ) : (
              <ProductList
                cart={cart}
                setCart={setCart}
                selectedCategory={selectedCategory}
                refreshProducts={refreshProducts}
                user={user}
              />
            )}
          </div>
        </main>
        {/* Account Modal */}
        {showAccountModal && (
          <AccountModal
            user={user}
            onClose={() => setShowAccountModal(false)}
            onSave={handleUpdateUser}
          />
        )}
      </div>
    </div>
  );
}

export default App;
