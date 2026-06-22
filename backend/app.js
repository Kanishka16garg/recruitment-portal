import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connection } from "./database/connection.js";
import { errorMiddleware } from "./middlewares/error.js";
import fileUpload from "express-fileupload";
import userRouter from "./routes/userRouter.js";
import jobRouter from "./routes/jobRouter.js";
import applicationRouter from "./routes/applicationRouter.js";
import { newsLetterCron } from "./automation/newsLetterCron.js";

const app = express();
config({ path: "./config/config.env" });

// Validate email configuration on startup
console.log("\n[APP] ===== Email Configuration Check =====");
console.log("[APP] SMTP_MAIL:", process.env.SMTP_MAIL ? process.env.SMTP_MAIL : "❌ NOT SET");
console.log("[APP] SMTP_PASSWORD:", process.env.SMTP_PASSWORD ? `✓ SET (${process.env.SMTP_PASSWORD.replace(/\s+/g, '').length} chars after cleanup)` : "❌ NOT SET");
console.log("[APP] SMTP_SERVICE:", process.env.SMTP_SERVICE || "NOT SET");
console.log("[APP] SMTP_HOST:", process.env.SMTP_HOST || "NOT SET");
if (!process.env.SMTP_MAIL || !process.env.SMTP_PASSWORD) {
  console.error("[APP] ⚠⚠⚠ WARNING: Email configuration is incomplete! ⚠⚠⚠");
  console.error("[APP] Emails will NOT be sent until SMTP_MAIL and SMTP_PASSWORD are configured.");
} else {
  console.log("[APP] ✓ Email configuration appears to be set");
}
console.log("[APP] ======================================\n");

// ✅ CORS Configuration - allow frontend origin and local dev
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "https://recruitment-portal-1-rsq5.onrender.com",
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("[CORS] Blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/application", applicationRouter);

// Connect to database and start cron job
(async () => {
  try {
    await connection();
    console.log("[APP] Database connected, starting cron job...");
    newsLetterCron();
    console.log("[APP] Cron job started successfully");
  } catch (err) {
    console.error("[APP] Failed to connect to database:", err);
  }
})();

app.use(errorMiddleware);

export default app;
