import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/user.routes.js";
import roomRoutes from "./src/routes/room.routes.js";
import bookingRoutes from "./src/routes/booking.routes.js";
import paymentRoutes from "./src/routes/payment.routes.js";
import { startBlacklistCleanup } from "./src/middleware/tokenBlacklist.js";
import { startDraftCleanupJob } from "./src/jobs/draftCleanup.js";
import { errorHandler } from "./src/middleware/error.middleware.js";

dotenv.config();

await connectDB();

// Start token blacklist cleanup (runs every 1 hour)
startBlacklistCleanup();

// Start draft room cleanup (runs every 1 hour)
startDraftCleanupJob();

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/v1/rooms", roomRoutes);   
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.get("/test", (req, res) => {
  res.send("Server is running");
});
app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});
