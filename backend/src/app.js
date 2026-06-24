import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import reviewRoutes from "./routes/review.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// CORS - allow frontend origin and credentials (cookies)
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);

// Preserve raw body for Razorpay webhook signature verification
app.use(
  express.json({
    verify: (req, res, buf) => {
      if (buf?.length) {
        req.rawBody = buf.toString("utf8");
      }
    },
  })
);
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/reviews", reviewRoutes);

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

export default app;