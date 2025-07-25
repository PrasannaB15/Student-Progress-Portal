import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import express, { Express, json, Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";

const app: Express = express();

// JSON body parser must come before route handling
app.use(json());

// CORS setup - for development, allow all origins or restrict to your frontend domain
app.use(
  cors({
    origin: "http://127.0.0.1:5500", // ✅ Your actual frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);



// Request logging
app.use(morgan("dev"));

// Debug middleware to log request paths and bodies
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log("🔍 Incoming request to", req.path);
  console.log("🧾 Body:", req.body);
  next();
});

// Import routes with ES module syntax - assuming you have `export default router` in authRoutes
import authRoutes from "./routes/authRoutes";
app.use("/api/auth", authRoutes);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`🚀 Server is live at http://localhost:${PORT}/`)
);
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("🔥 Server Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});
