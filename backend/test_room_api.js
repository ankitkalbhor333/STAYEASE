/**
 * Test Room API Endpoints
 * Run: node test_room_api.js
 */

import dotenv from "dotenv";
import axios from "axios";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Load env variables first
dotenv.config();

// Import User model
import User from "./src/model/User.js";
import db from "./src/config/db.js";

const BASE_URL = "http://localhost:3000";

// Test user credentials (you may need to create this user first)
const testUser = {
  email: "test@example.com",
  password: "Test@123",
};

let authToken = "";
let roomId = "";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Test endpoints
const tests = {
  // 0. Register User (if not exists)
  register: async () => {
    try {
      console.log("\n📝 Testing User Registration...");
      const res = await api.post("/api/auth/register", {
        name: "Test User",
        email: testUser.email,
        password: testUser.password,
        phone: "9876543210",
      });
      console.log("✅ User registered");
      return true;
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes("already exists")) {
        console.log("ℹ️  User already exists, proceeding to login");
        return true;
      }
      console.log("❌ Registration failed:", error.response?.data?.message || error.message);
      return false;
    }
  },

  // 1. Register or Login
  login: async () => {
    try {
      console.log("\n🔐 Testing Login...");
      const res = await api.post("/api/auth/login", testUser);
      console.log("✅ Login successful");
      console.log("   Token:", res.data.token?.substring(0, 20) + "...");
      authToken = res.data.token;
      return true;
    } catch (error) {
      console.log("❌ Login failed:", error.response?.data?.message || error.message);
      if (error.response?.data?.errors) {
        console.log("   Errors:", error.response.data.errors);
      }
      return false;
    }
  },

  // 2. Create Draft Room
  createDraft: async () => {
    try {
      console.log("\n📝 Testing Create Draft Room...");
      const res = await api.post("/api/v1/rooms", {});
      console.log("✅ Draft room created");
      console.log("   Room ID:", res.data.data.roomId);
      console.log("   Status:", res.data.data.status);
      console.log("   Current Step:", res.data.data.currentStep);
      roomId = res.data.data.roomId;
      return true;
    } catch (error) {
      console.log("❌ Create draft failed:", error.response?.data?.message || error.message);
      return false;
    }
  },

  // 3. Update Step 1: Basic
  updateBasic: async () => {
    try {
      console.log("\n📋 Testing Step 1: Basic Information...");
      const res = await api.patch(`/api/v1/rooms/${roomId}?step=basic`, {
        title: "Luxury Beachfront Apartment",
        description: "Beautiful apartment with ocean view and full amenities. Perfect for families and groups.",
        propertyType: "Apartment",
        roomType: "Entire Place",
      });
      console.log("✅ Step 1 updated");
      console.log("   Completed Steps:", res.data.data.completedSteps);
      console.log("   Progress:", res.data.data.progressPercentage + "%");
      return true;
    } catch (error) {
      console.log("❌ Step 1 failed:", error.response?.data?.errors || error.response?.data?.message || error.message);
      return false;
    }
  },

  // 4. Update Step 2: Location
  updateLocation: async () => {
    try {
      console.log("\n🌍 Testing Step 2: Location...");
      const res = await api.patch(`/api/v1/rooms/${roomId}?step=location`, {
        country: "India",
        state: "Maharashtra",
        city: "Mumbai",
        area: "Bandra",
        fullAddress: "123 Sea View Lane, Bandra Reclamation",
        pincode: "400050",
        phoneNumber: "9876543210",
      });
      console.log("✅ Step 2 updated");
      console.log("   Completed Steps:", res.data.data.completedSteps);
      console.log("   Progress:", res.data.data.progressPercentage + "%");
      return true;
    } catch (error) {
      console.log("❌ Step 2 failed:", error.response?.data?.errors || error.response?.data?.message || error.message);
      return false;
    }
  },

  // 5. Update Step 3: Pricing
  updatePricing: async () => {
    try {
      console.log("\n💰 Testing Step 3: Pricing...");
      const res = await api.patch(`/api/v1/rooms/${roomId}?step=pricing`, {
        pricePerDay: 5000,
        pricePerWeek: 30000,
        pricePerMonth: 100000,
        cleaningFee: 1500,
        securityDeposit: 15000,
      });
      console.log("✅ Step 3 updated");
      console.log("   Completed Steps:", res.data.data.completedSteps);
      console.log("   Progress:", res.data.data.progressPercentage + "%");
      return true;
    } catch (error) {
      console.log("❌ Step 3 failed:", error.response?.data?.errors || error.response?.data?.message || error.message);
      return false;
    }
  },

  // 6. Update Step 4: Capacity
  updateCapacity: async () => {
    try {
      console.log("\n👥 Testing Step 4: Capacity...");
      const res = await api.patch(`/api/v1/rooms/${roomId}?step=capacity`, {
        maxGuests: 6,
        bedrooms: 2,
        beds: 3,
        bathrooms: 2,
      });
      console.log("✅ Step 4 updated");
      console.log("   Completed Steps:", res.data.data.completedSteps);
      console.log("   Progress:", res.data.data.progressPercentage + "%");
      return true;
    } catch (error) {
      console.log("❌ Step 4 failed:", error.response?.data?.errors || error.response?.data?.message || error.message);
      return false;
    }
  },

  // 7. Update Step 5: Amenities
  updateAmenities: async () => {
    try {
      console.log("\n✨ Testing Step 5: Amenities...");
      const res = await api.patch(`/api/v1/rooms/${roomId}?step=amenities`, {
        "amenities.wifi": true,
        "amenities.kitchen": true,
        "amenities.parking": true,
        "amenities.airConditioner": true,
        "amenities.tv": true,
        "amenities.geyser": true,
        "amenities.workspace": true,
      });
      console.log("✅ Step 5 updated");
      console.log("   Completed Steps:", res.data.data.completedSteps);
      console.log("   Progress:", res.data.data.progressPercentage + "%");
      return true;
    } catch (error) {
      console.log("❌ Step 5 failed:", error.response?.data?.errors || error.response?.data?.message || error.message);
      return false;
    }
  },

  // 8. Update Step 7: Availability (Skipping images for now)
  updateAvailability: async () => {
    try {
      console.log("\n📅 Testing Step 7: Availability...");
      const res = await api.patch(`/api/v1/rooms/${roomId}?step=availability`, {
        availableFrom: "2026-07-01",
        availableTo: "2026-12-31",
      });
      console.log("✅ Step 7 updated");
      console.log("   Completed Steps:", res.data.data.completedSteps);
      console.log("   Progress:", res.data.data.progressPercentage + "%");
      return true;
    } catch (error) {
      console.log("❌ Step 7 failed:", error.response?.data?.errors || error.response?.data?.message || error.message);
      return false;
    }
  },

  // 9. Get Progress
  getProgress: async () => {
    try {
      console.log("\n📊 Testing Get Progress...");
      const res = await api.get(`/api/v1/rooms/${roomId}/progress`);
      console.log("✅ Progress retrieved");
      console.log("   Completed Steps:", res.data.data.completedSteps);
      console.log("   Total Steps:", res.data.data.totalSteps);
      console.log("   Progress:", res.data.data.progressPercentage + "%");
      console.log("   Next Step:", res.data.data.nextStep);
      return true;
    } catch (error) {
      console.log("❌ Get progress failed:", error.response?.data?.message || error.message);
      return false;
    }
  },

  // 10. Check Publishing Readiness
  checkReadiness: async () => {
    try {
      console.log("\n🚀 Testing Publish Readiness...");
      const res = await api.get(`/api/v1/rooms/${roomId}/publish-readiness`);
      console.log("✅ Readiness checked");
      console.log("   Ready to Publish:", res.data.data.isReadyToPublish);
      if (!res.data.data.isReadyToPublish) {
        console.log("   Missing Fields:", res.data.data.missingFields);
      }
      return true;
    } catch (error) {
      console.log("❌ Check readiness failed:", error.response?.data?.message || error.message);
      return false;
    }
  },
};

// Run all tests
async function runTests() {
  console.log("=".repeat(60));
  console.log("🧪 ROOM API TESTING");
  console.log("=".repeat(60));

  // Connect to MongoDB and create test user
  try {
    await db();
    console.log("✅ Connected to MongoDB");

    // Create or update test user (verified)
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    const testUserInDb = await User.findOneAndUpdate(
      { email: testUser.email },
      {
        name: "Test User",
        email: testUser.email,
        phone: "9876543210",
        password: hashedPassword,
        isVerified: true,
      },
      { upsert: true, new: true }
    );
    console.log("✅ Test user ready");
  } catch (error) {
    console.log("❌ Database error:", error.message);
    process.exit(1);
  }

  // Check if server is running
  try {
    await api.get("/test");
  } catch (error) {
    console.log("❌ Server is not running on http://localhost:3000");
    console.log("   Run: node server.js");
    process.exit(1);
  }

  // Run tests
  if (await tests.login()) {
    await tests.createDraft();
    if (roomId) {
      await tests.updateBasic();
      await tests.updateLocation();
      await tests.updatePricing();
      await tests.updateCapacity();
      await tests.updateAmenities();
      await tests.updateAvailability();
      await tests.getProgress();
      await tests.checkReadiness();
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Testing complete!");
  console.log("=".repeat(60));
}

runTests().catch(console.error);
