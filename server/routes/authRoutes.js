import express from "express";
import { supabase } from "../supabaseClient.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({
    message: "Account created",
    user: { id: data.user.id, email: data.user.email },
  });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  res.cookie("token", data.session.access_token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 1000,
  });

  res.json({
    message: "Logged in",
    user: { id: data.user.id, email: data.user.email },
  });
});

// LOGOUT (protected)
router.post("/logout", requireAuth, (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

export default router;