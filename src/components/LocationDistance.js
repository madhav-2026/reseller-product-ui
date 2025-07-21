import React, { useEffect } from "react";

// Replace these with your shop's coordinates
const SHOP_LAT = 17.544057; // Example: Hyderabad latitude
const SHOP_LNG = 78.285794; // Example: Hyderabad longitude
const SHOP_ADDRESS = "ATO Shop, Main Road, Hyderabad, Telangana"; // <-- Update with your actual address

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

export default function LocationDistance({ user, setDeliveryDistance }) {
  const [customerLocation, setCustomerLocation] = React.useState(null);

  React.useEffect(() => {
    if (user && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCustomerLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          // Optionally, calculate distance from shop to customer
          const dist = getDistanceFromLatLonInKm(
            SHOP_LAT,
            SHOP_LNG,
            position.coords.latitude,
            position.coords.longitude
          );
          if (setDeliveryDistance) setDeliveryDistance(dist);
        },
        () => {
          setCustomerLocation(null);
        }
      );
    }
  }, [user, setDeliveryDistance]);

  // Estimate delivery time: e.g., 10 minutes per km
  const estimatedMinutes = 30; // You can calculate based on distance if needed

  return (
    <div className="flex flex-col items-start gap-0">
      {user && customerLocation ? (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${customerLocation.lat},${customerLocation.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-700 hover:underline"
          style={{ whiteSpace: "nowrap" }}
        >
          <svg
            className="w-5 h-5 text-blue-700"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
          </svg>
          <span className="font-semibold">Your Location (Click to view on map)</span>
        </a>
      ) : (
        <span className="font-semibold text-red-500">Location not available</span>
      )}
      <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded mt-1">
        Delivery in {estimatedMinutes} min
      </span>
    </div>
  );
}