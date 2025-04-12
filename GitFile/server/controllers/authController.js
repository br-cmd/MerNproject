// controllers/authController.js

// In-memory users (temporary store)
const users = [];

export const registerController = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }

  users.push({ name, email, password });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
  });
};

export const loginController = (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    (user) => user.email === email && user.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  res.status(200).json({
    success: true,
    message: "Login successful",
    user: {
      name: user.name,
      email: user.email,
    },
  });
};

export const logoutController = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
