import express from "express";
import bcrypt from "bcrypt";
import { getUserByEmail, createUser } from "../database.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await getUserByEmail(email);
  if (existingUser)
    return res.status(409).json({ message: "Email already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = await createUser(email, hashedPassword);
  req.session.userId = userId;
  res.status(201).json({ message: "User registered", userId });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await getUserByEmail(email);
  if (!user) return res.status(404).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ message: "Incorrect password" });

  req.session.userId = user.id;
  res.json({ message: "Login successful", userId: user.id });
});

router.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out successfully" });
});

export default router;
