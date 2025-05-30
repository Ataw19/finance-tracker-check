import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";

import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import { isAuthenticated } from "./middleware/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true jika HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 hari
    },
  })
);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", isAuthenticated, dashboardRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("API Finance Tracker is running.");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
