import dotenv from "dotenv";
dotenv.config();


import express from "express";
import mongoose from "mongoose";
import authRouter from "./routes/auth.routs.js";
import discountRouter from "./routes/discount.route.js";
import orderRouter from "./routes/order.rout.js";
import userRouter from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import nodemailer from "nodemailer";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Additional Routers
import inventoryRouter from "./routes/inventory.routs.js";
import promotionRouter from "./routes/promotion.routes.js";

// Define JWT Secret Key Here
const JWT_SECRET =  process.env.JWT_SECRET ||"a3d8c1f7e2b49c9e5f7f86b1e7a3d8c1f7e2b49c9e5f7f86b1e7a3d8c1f7e2b49"; // Replace with a strong random key

const MONGODB_URL =
  "mongodb+srv://harytharan24:hary123@cluster0.bxdvzwm.mongodb.net/fashion?retryWrites=true&w=majority";

// Connect to MongoDB
mongoose
  .connect(MONGODB_URL)
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => console.log("Error connecting to MongoDB", err));

const app = express();

app.get("/", (req, res) => res.json({ message: "Welcome to the app" }));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["https://fashio-nexus.vercel.app/"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set Up File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use("/uploads", express.static(join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/discount", discountRouter);
app.use("/api/order", orderRouter);
app.use("/api/inventories", inventoryRouter);
app.use("/api/promotions", promotionRouter);

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({ success: false, statusCode, message });
});

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "harytharan24@gmail.com",
    pass: "mjhd lnar hjsi rwnd",
  },
});

// OTP Storage
const otpMap = new Map();
const generateOTP = () => Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join("");

// Route to Send OTP
app.post("/api/auth/sendotp", (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  otpMap.set(email, otp);

  const mailOptions = {
    from: "harytharan24@gmail.com",
    to: email,
    subject: "Email Verification OTP",
    html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
  };

  transporter.sendMail(mailOptions, (error, info) =>
    error
      ? res.status(500).json({ success: false, message: "Failed to send OTP" })
      : res.status(200).json({ success: true, message: "OTP sent successfully" })
  );
});

// Route to Verify OTP
app.post("/api/auth/verifyotp", (req, res) => {
  const { email, otp } = req.body;
  if (otp !== otpMap.get(email)) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }
  otpMap.delete(email);
  res.status(200).json({ success: true, message: "OTP verified successfully" });
});

// Start Server
app.listen(3000, () => console.log("Server listening on port 3000!"));
