import axios from "axios";

/**
 * Reverse geocode coordinates into a structured address (OpenStreetMap Nominatim).
 */
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          format: "jsonv2",
          lat: latitude,
          lon: longitude,
        },
        headers: {
          "User-Agent": "Stayease/1.0",
        },
        timeout: 10000,
      }
    );

    const addr = response.data?.address || {};

    return {
      city:
        addr.city ||
        addr.town ||
        addr.village ||
        addr.municipality ||
        addr.county ||
        "",
      state: addr.state || addr.region || "",
      country: addr.country || "",
      pincode: addr.postcode || "",
      area:
        addr.suburb ||
        addr.neighbourhood ||
        addr.quarter ||
        addr.district ||
        "",
      fullAddress: response.data?.display_name || "",
    };
  } catch (error) {
    throw new Error(
      `Geocoding failed: ${error.response?.data?.error || error.message}`
    );
  }
};

/** @deprecated Use getAddressFromCoordinates */
export const geocodeAddress = getAddressFromCoordinates;
