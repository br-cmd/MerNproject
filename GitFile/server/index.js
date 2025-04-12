// ======= server.js =======
import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

import connectDb from "./config/db.js";
import testRoutes from "./routes/testRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import jobsRoutes from "./routes/jobsRoute.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";

dotenv.config();
connectDb();

const app = express();

// ✅ CORS Fix for Cookies on Vercel
app.use(
  cors({
    origin: "https://mer-nproject-client.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Middleware
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// ✅ Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Job Portal Application",
      description: "Node Expressjs Job Portal Application",
    },
    servers: [{ url: "https://mer-nproject-gamma.vercel.app" }],
  },
  apis: ["./routes/*.js"],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ Routes
app.use("/api/v1/test", testRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/job", jobsRoutes);

// ✅ Root
app.get("/", (req, res) => {
  res.json({ message: "job-portal main api end-point" });
});

// ✅ Error Handler
app.use(errorMiddleware);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `Node Server Running in ${process.env.DEV_MODE} on Port ${PORT}`.bgCyan.white
  );
});


// ======= utils/tokenUtils.js =======
import jwt from "jsonwebtoken";
import RefreshModel from "../models/refresh-model.js";

const generateToken = (payload) => {
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "1y",
  });

  return { accessToken, refreshToken };
};

const storeRefreshToken = async (token, userId) => {
  await RefreshModel.create({ token, userId });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};

const findRefreshToken = async (userId, token) => {
  return await RefreshModel.findOne({ userId, token });
};

const updateRefreshToken = async (userId, token) => {
  return await RefreshModel.updateOne({ userId }, { token });
};

const removeTokenFromDb = async (refreshToken) => {
  return await RefreshModel.deleteOne({ token: refreshToken });
};

export {
  generateToken,
  storeRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  findRefreshToken,
  updateRefreshToken,
  removeTokenFromDb,
};
