import React from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix leaflet's default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Replace these with your shop's coordinates
const SHOP_LAT = 17.5585949; // Example: Hyderabad latitude
const SHOP_LNG = 78.2617028; // Example: Hyderabad longitude

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

function getAddressFromCoords(lat, lng, setAddress, user) {
  // Use a free reverse geocoding API (like Nominatim OpenStreetMap)
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
    headers: {
      'User-Agent': 'ato/1.0'
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data && data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress("Your Location");
      }
    })
    .catch(() => setAddress("Your Location"));
}

function AddressModal({ onClose, onSave, user }) {
  const [form, setForm] = React.useState({
    address: "",
    pincode: "",
    lat: 17.5585949,
    lng: 78.2617028,
  });
  const [mapAddress, setMapAddress] = React.useState("");

  // Set map to user's current location when modal opens
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm(f => ({
            ...f,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }));
          // Fetch address for initial location, but do NOT fill address field
          getAddressFromCoords(
            position.coords.latitude,
            position.coords.longitude,
            (address) => {
              setMapAddress(address.split(",").slice(0, 2).join(","));
            }
          );
        }
      );
    }
  }, []);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setForm(f => ({ ...f, lat: e.latlng.lat, lng: e.latlng.lng }));
        getAddressFromCoords(
          e.latlng.lat,
          e.latlng.lng,
          (address) => {
            setMapAddress(address.split(",").slice(0, 2).join(","));
          }
        );
      },
    });
    return <Marker position={[form.lat, form.lng]} />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-3 text-xl"
          onClick={onClose}
        >×</button>
        <h2 className="text-lg font-bold mb-2">Add Address</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            // Save address, pincode, lat, lng to DB via onSave
            onSave(form);
          }}
        >
          <input
            className="w-full border rounded px-2 py-1 mb-2"
            placeholder="Enter full address"
            required
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
          />
          <input
            className="w-full border rounded px-2 py-1 mb-2"
            placeholder="Pincode"
            required
            value={form.pincode}
            onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))}
          />
          <div className="mb-2">
            <label className="block mb-1 font-semibold">Select on Map:</label>
            <MapContainer
              center={[form.lat, form.lng]}
              zoom={13}
              style={{ height: "200px", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker />
            </MapContainer>
            <div className="text-xs mt-1">
              {mapAddress
                ? <>Selected: <span className="font-semibold">{mapAddress}</span></>
                : "Click on map to select address"}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded mt-2"
          >
            Save Address
          </button>
        </form>
      </div>
    </div>
  );
}

// Example backend API call to store address with customer phone number
async function saveAddressToBackend(form, user) {
   const params = new URLSearchParams({
      phone: user?.phone || ""
   });
  const response = await fetch(`http://localhost:9090/api/customer/address?${params.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      address: form.address,
      pinCode: form.pincode,
      lat: form.lat,
      lng: form.lng,
    }),
  });
  return response.json();
}

export default function LocationDistance({ user, setEstimatedMinutes, setDeliveryDistance }) {
  const [customerLocation, setCustomerLocation] = React.useState(null);
  const [customerAddress, setCustomerAddress] = React.useState("Your Location");
  const [estimatedMinutesState, setEstimatedMinutesState] = React.useState(30);
  const [loadingAddress, setLoadingAddress] = React.useState(false);
  const [addressDropdown, setAddressDropdown] = React.useState(false);
  const [showAddressModal, setShowAddressModal] = React.useState(false);
  const [savedAddresses, setSavedAddresses] = React.useState([]);
  const dropdownRef = React.useRef();

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!addressDropdown) return;
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAddressDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [addressDropdown]);

  React.useEffect(() => {
    if (user && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCustomerLocation({ lat, lng });
          setLoadingAddress(true);
          getAddressFromCoords(lat, lng, (address) => {
            setCustomerAddress(address);
            setLoadingAddress(false);
          });
          // Calculate distance from shop to customer
          const dist = getDistanceFromLatLonInKm(
            SHOP_LAT,
            SHOP_LNG,
            lat,
            lng
          );
          if (setDeliveryDistance) setDeliveryDistance(dist);
          // Estimate delivery time: 10 minutes per km, minimum 30 min
          setEstimatedMinutesState(Math.max(30, Math.round(dist * 10)));
        },
        () => {
          setCustomerLocation(null);
          setCustomerAddress("Location not available");
          setEstimatedMinutesState(30);
        }
      );
    }
  }, [user, setDeliveryDistance]);

  // Load saved addresses from backend
  React.useEffect(() => {
    if (user?.phone) {
      fetch(`http://localhost:9090/api/customer/${user.phone}`)
        .then(res => res.json())
        .then(data => {
          // If your backend returns a customer object, use data.addresses
          if (Array.isArray(data)) {
            setSavedAddresses(data);
          } else if (Array.isArray(data.addresses)) {
            setSavedAddresses(data.addresses);
          } else {
            setSavedAddresses([]);
          }
        });
    }
  }, [user]);

  // Handler for using current location
  const handleUseCurrentLocation = () => {
    setAddressDropdown(false);
    if (navigator.geolocation) {
      setLoadingAddress(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCustomerLocation({ lat, lng });
          getAddressFromCoords(lat, lng, (address) => {
            setCustomerAddress(address);
            setLoadingAddress(false);
          });
          const dist = getDistanceFromLatLonInKm(
            SHOP_LAT,
            SHOP_LNG,
            lat,
            lng
          );
          if (setDeliveryDistance) setDeliveryDistance(dist);
          setEstimatedMinutesState(Math.max(30, Math.round(dist * 10)));
        },
        () => {
          setCustomerLocation(null);
          setCustomerAddress("Location not available");
          setEstimatedMinutesState(30);
          setLoadingAddress(false);
        }
      );
    }
  };

  const handleAddAddress = () => {
    setShowAddressModal(true);
    setAddressDropdown(false);
  };

  async function handleSaveAddress(form) {
    setCustomerAddress(
      `${form.address}, ${form.pincode}`
    );
    setCustomerLocation({ lat: form.lat, lng: form.lng });
    setShowAddressModal(false);
    // Optionally, update delivery distance and time here
    const dist = getDistanceFromLatLonInKm(
      SHOP_LAT,
      SHOP_LNG,
      form.lat,
      form.lng
    );
    if (setDeliveryDistance) setDeliveryDistance(dist);
    setEstimatedMinutesState(Math.max(30, Math.round(dist * 10)));
    // Save to backend
    await saveAddressToBackend(form, user);
    // Refresh address list
    if (user?.phone) {
      fetch(`http://localhost:9090/api/customer/${user.phone}`)
        .then(res => res.json())
        .then(data => setSavedAddresses(data || []));
    }
  }

  return (
    <div className="flex flex-col items-start gap-0 relative">
      {user && (
        <>
          <div className="flex items-center mb-1 relative" ref={dropdownRef}>
            {/* Dropdown button */}
            <button
              type="button"
              className="font-semibold flex items-center gap-1 bg-white px-2 py-1 rounded shadow border border-blue-200"
              onClick={() => setAddressDropdown((open) => !open)}
            >
              {/* Show only the map icon if address is selected, and make it clickable */}
              {customerLocation && customerAddress && customerAddress !== "Your Location" && customerAddress !== "Location not available" && (
                <span
                  className="cursor-pointer"
                  onClick={e => {
                    e.stopPropagation();
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${customerLocation.lat},${customerLocation.lng}`,
                      "_blank"
                    );
                  }}
                  title="View on Map"
                >
                  <svg
                    className="w-4 h-4 text-blue-700 mr-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
                  </svg>
                </span>
              )}
              {loadingAddress
                ? "Fetching address..."
                : (() => {
                    // Show only area (second part) if possible, else fallback
                    const parts = customerAddress.split(",");
                    return parts[0]?.trim() || parts[0];
                  })()}
              <svg
                className="w-4 h-4 text-blue-700"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {addressDropdown && (
              <div className="absolute left-0 top-full mt-1 bg-white border rounded shadow w-56 z-50">
                {/* Current Location Option */}
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-blue-50"
                  onClick={handleUseCurrentLocation}
                >
                  Use Current Location
                </button>
                {/* List all saved addresses */}
                {Array.isArray(savedAddresses) && savedAddresses.map((addr, idx) => (
                  <div
                    key={addr.id || idx}
                    className="flex items-center block w-full text-left px-4 py-2 text-blue-900 font-semibold border-b border-blue-100 bg-blue-50 cursor-pointer"
                    onClick={() => {
                      setCustomerAddress(`${addr.address}, ${addr.pincode}`);
                      setCustomerLocation({ lat: addr.lat, lng: addr.lng });
                      setAddressDropdown(false);
                      // Update delivery time when address is selected
                      const dist = getDistanceFromLatLonInKm(
                        SHOP_LAT,
                        SHOP_LNG,
                        addr.lat,
                        addr.lng
                      );
                      if (setDeliveryDistance) setDeliveryDistance(dist);
                      setEstimatedMinutesState(Math.max(30, Math.round(dist * 10))); // <-- use the local state setter
                    }}
                  >
                    <span className="flex-1">{addr.address}, {addr.pincode}</span>
                    <span
                      className="ml-2 cursor-pointer"
                      onClick={e => {
                        e.stopPropagation();
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${addr.lat},${addr.lng}`,
                          "_blank"
                        );
                      }}
                      title="View on Map"
                    >
                      <svg
                        className="w-4 h-4 text-blue-700"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
                      </svg>
                    </span>
                  </div>
                ))}
                {/* Add Address Option */}
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-blue-50"
                  onClick={handleAddAddress}
                >
                  Add New Address
                </button>
              </div>
            )}
          </div>
          {showAddressModal && (
            <AddressModal
              onClose={() => setShowAddressModal(false)}
              onSave={handleSaveAddress}
            />
          )}
        </>
      )}
      <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded mt-1">
        Delivery in {estimatedMinutesState} min
      </span>
    </div>
  );
}