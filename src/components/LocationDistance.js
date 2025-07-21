import React, { useState, useEffect } from "react";

// Replace these with your shop's coordinates
const SHOP_LAT = 17.544057; // Example: Hyderabad latitude
const SHOP_LNG = 78.285794; // Example: Hyderabad longitude

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

export default function LocationDistance({ setDeliveryDistance }) {
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    // Hardcoded destination coordinates
    const DEST_LAT = 17.558595;
    const DEST_LNG = 78.261703;

    const dist = getDistanceFromLatLonInKm(
      SHOP_LAT,
      SHOP_LNG,
      DEST_LAT,
      DEST_LNG
    );
    setDistance(dist.toFixed(2));
    if (setDeliveryDistance) setDeliveryDistance(dist);
  }, [setDeliveryDistance]);

  return (
    <div>
      {distance && (
        <div>
          Distance from source: <b>{distance} km</b>
        </div>
      )}
    </div>
  );
}