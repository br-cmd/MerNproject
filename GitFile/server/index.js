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

// CORS Middleware
app.use(
  cors({
    origin: [
      "https://mer-nproject-client.vercel.app", // Production frontend URL
      "http://localhost:3000",  // Local development
      "http://localhost:3001",  // Another local development (if necessary)
    ],
    credentials: true,  // Allow cookies to be sent with requests
    optionsSuccessStatus: 200,
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

// Swagger Setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Job Portal Application",
      description: "Node Expressjs Job Portal Application",
    },
    servers: [
      {
        url: "https://mer-nproject-gamma.vercel.app",  // Change this URL accordingly
      },
    ],
  },
  apis: ["./routes/*.js"],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/v1/test", testRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/job", jobsRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Job-portal main API end-point" });
});

// Error Handler
app.use(errorMiddleware);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `Node Server Running in ${process.env.DEV_MODE} on Port ${PORT}`.bgCyan.white
  );
});
