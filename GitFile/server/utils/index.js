import jwt from "jsonwebtoken";
import RefreshModel from "../models/refresh-model.js";

// Retrieve the access and refresh secret tokens from environment variables

const generateToken = (payload) => {
  // Generate the access token with a 1-hour expiration time
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });

  // Generate the refresh token with a 1-year expiration time
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "1y",
  });

  // Return the generated tokens as an object
  return { accessToken, refreshToken };
};

// Store the refresh-token in the database
const storeRefreshToken = async (token, userId) => {
  try {
    await RefreshModel.create({ token, userId });
  } catch (error) {
    console.error("Error storing refresh token:", error.message);
  }
};

// Verify the access-token
const verifyAccessToken = async (token) => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new Error("Invalid access token");
  }
};

// Verify the refresh-token
const verifyRefreshToken = async (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};

// Find refresh token in the database
const findRefreshToken = async (userId, token) => {
  try {
    return await RefreshModel.findOne({ userId: userId, token: token });
  } catch (error) {
    console.error("Error finding refresh token:", error.message);
  }
};

// Update refresh token in the database
const updateRefreshToken = async (userId, token) => {
  try {
    return await RefreshModel.updateOne(
      { userId: userId },
      { token: token }
    );
  } catch (error) {
    console.error("Error updating refresh token:", error.message);
  }
};

// Remove token from the database
const removeTokenFromDb = async (refreshToken) => {
  try {
    return await RefreshModel.deleteOne({ token: refreshToken });
  } catch (error) {
    console.error("Error removing refresh token from DB:", error.message);
  }
};

// Refresh route logic
const refreshTokens = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided." });
    }

    const decoded = await verifyRefreshToken(refreshToken);
    const storedToken = await findRefreshToken(decoded.userId, refreshToken);

    if (!storedToken) {
      return res.status(401).json({ message: "Invalid refresh token." });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateToken({
      userId: decoded.userId,
    });

    await updateRefreshToken(decoded.userId, newRefreshToken);

    // Set new refresh token as a cookie with httpOnly and secure options
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true, // ensure HTTPS
      sameSite: "None", // required for cross-origin requests
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year expiration
    });

    res.json({ accessToken });
  } catch (error) {
    console.error("Token refresh failed:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

export {
  generateToken,
  storeRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  findRefreshToken,
  updateRefreshToken,
  removeTokenFromDb,
  refreshTokens,
};
