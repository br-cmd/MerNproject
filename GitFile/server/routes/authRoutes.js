// ====== routes/authRoutes.js ======
import express from "express";

const router = express.Router();

// Dummy login endpoint (no tokens)
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Fake user for demo
  const user = {
    email: "demo@example.com",
    password: "123456",
    name: "Demo User",
    role: "user"
  };

  if (email === user.email && password === user.password) {
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } else {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

export default router;
