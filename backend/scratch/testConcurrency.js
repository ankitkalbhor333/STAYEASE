import mongoose from "mongoose";
import connectDB from "../src/config/db.js";
import Room from "../src/model/Room.js";
import User from "../src/model/User.js";
import { createBooking } from "../src/services/booking.service.js";
import dotenv from "dotenv";

dotenv.config();

const runTest = async () => {
  try {
    console.log("Connecting to Database...");
    await connectDB();

    // 1. Find or create a test host/owner
    let owner = await User.findOne({ email: "owner@stayease.com" });
    if (!owner) {
      owner = await User.create({
        name: "Test Owner",
        email: "owner@stayease.com",
        password: "Password123!",
        role: "OWNER",
        isEmailVerified: true
      });
      console.log("Created test owner:", owner._id);
    }

    // 2. Find or create a test user
    let userA = await User.findOne({ email: "usera@stayease.com" });
    if (!userA) {
      userA = await User.create({
        name: "User A",
        email: "usera@stayease.com",
        phone: "1111111111",
        password: "Password123!",
        role: "USER",
        isEmailVerified: true
      });
    }

    let userB = await User.findOne({ email: "userb@stayease.com" });
    if (!userB) {
      userB = await User.create({
        name: "User B",
        email: "userb@stayease.com",
        phone: "2222222222",
        password: "Password123!",
        role: "USER",
        isEmailVerified: true
      });
    }

    // 3. Find or create a test active room
    let room = await Room.findOne({ title: "Concurrency Test Room" });
    if (!room) {
      room = await Room.create({
        title: "Concurrency Test Room",
        description: "A room created for concurrency testing",
        propertyType: "Apartment",
        roomType: "Entire Place",
        pricePerDay: 100,
        maxGuests: 4,
        bedrooms: 1,
        beds: 2,
        bathrooms: 1,
        availableFrom: new Date("2026-07-01"),
        availableTo: new Date("2026-07-20"),
        ownerId: owner._id,
        status: "active"
      });
      console.log("Created test room:", room._id);
    } else {
      // Reset status to active and dates
      room.status = "active";
      room.availableFrom = new Date("2026-07-01");
      room.availableTo = new Date("2026-07-20");
      await room.save();
    }

    // Clear any previous bookings for this room to ensure clean state
    const Booking = mongoose.model("Booking");
    await Booking.deleteMany({ roomId: room._id });
    console.log("Cleared old bookings for the test room.");

    console.log("\n--- SIMULATING CONCURRENT DOUBLE BOOKINGS ---");
    const checkIn = "2026-07-05";
    const checkOut = "2026-07-10";

    const p1 = createBooking(userA._id, {
      roomId: room._id.toString(),
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests: 2
    });

    const p2 = createBooking(userB._id, {
      roomId: room._id.toString(),
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests: 2
    });

    const results = await Promise.allSettled([p1, p2]);

    results.forEach((res, idx) => {
      const user = idx === 0 ? "User A" : "User B";
      if (res.status === "fulfilled") {
        console.log(`\x1b[32m[SUCCESS] ${user} booking created successfully! ID: ${res.value.booking._id}\x1b[0m`);
      } else {
        console.log(`\x1b[31m[FAILED] ${user} booking rejected: ${res.reason.message} (status code: ${res.reason.statusCode})\x1b[0m`);
      }
    });

    const finalBookings = await Booking.find({ roomId: room._id });
    console.log(`\nFinal booking count in DB: ${finalBookings.length}`);
    if (finalBookings.length === 1) {
      console.log("\x1b[32m✔ SUCCESS: Concurrency check passed! Exactly one reservation was created.\x1b[0m");
    } else {
      console.log("\x1b[31m✘ FAILURE: Concurrency check failed. Double booking detected!\x1b[0m");
    }

  } catch (err) {
    console.error("Test execution failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from Database.");
  }
};

runTest();
