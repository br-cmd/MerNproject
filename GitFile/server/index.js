// ====== server.js (Login Re-enabled, No Tokens) ======
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
import jobsRoutes from "./routes/jobsRoute.js";
import authRoutes from "./routes/authRoutes.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";

dotenv.config();
connectDb();

const app = express();

// CORS
app.use(
  cors({
    origin: ["https://mer-nproject-client.vercel.app", "http://localhost:3000"],
    credentials: true,
  })
);

// Security Middleware
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

// General Middleware
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Swagger Docs
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Job Portal (Login Only, No Tokens)",
      description: "Job Portal API with login but no JWT authentication"
    },
    servers: [{ url: "https://mer-nproject-gamma.vercel.app" }],
  },
  apis: ["./routes/*.js"]
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/v1/test", testRoutes);
app.use("/api/v1/job", jobsRoutes);
app.use("/api/v1/auth", authRoutes);

// Dummy user endpoint
app.get("/api/v1/user/get-user", (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      name: "Guest User",
      email: "guest@example.com",
      role: "user"
    },
  });
});

// Root
app.get("/", (req, res) => {
  res.json({ message: "Job Portal API (Login Only, No Auth)" });
});

// Error Middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`.bgMagenta.white);
});
