import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";
import authRoutes from "./src/routes/authRoutes.js";

dotenv.config();

await connectDB();
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.get("/test",(req,res)=>{
  res.send("Server is running");
})
app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});
