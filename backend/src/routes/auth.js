import express from "express";
import { generateToken, authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  if (password !== adminPassword) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = generateToken({ role: "admin" });

  res.json({
    success: true,
    message: "Login successful",
    token,
  });
});

// GET /api/auth/verify - Verify token is still valid
router.get("/verify", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Token is valid",
    user: req.user,
  });
});

export default router;
