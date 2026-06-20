import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import reviewRoutes from "./routes/review.route.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/reviews", reviewRoutes);
// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

export default app;