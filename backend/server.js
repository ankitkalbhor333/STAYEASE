import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/user.routes.js";
import roomRoutes from "./src/routes/room.routes.js";
import { startBlacklistCleanup } from "./src/middleware/tokenBlacklist.js";
import roomRoutes from "./src/routes/room.routes.js";

dotenv.config();

await connectDB();

// Start token blacklist cleanup (runs every 1 hour)
startBlacklistCleanup();

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
<<<<<<< HEAD
app.use("/api/room", roomRoutes);
=======
app.use("/api/room",roomRoutes);


>>>>>>> a94b44a (room api)
const PORT = process.env.PORT || 5000;
app.get("/test", (req, res) => {
  res.send("Server is running");
});
app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});
