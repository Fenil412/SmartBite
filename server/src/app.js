import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
dotenv.config({
  path: './.env'
})

const app = express()

const allowedOrigins = [
  "http://localhost:5173",                     // local dev
  "http://localhost:5174",                     // local dev (alternate port)
  "https://smart-bite-woad.vercel.app",        // deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  credentials: true,
}));



app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))
app.use(express.static("public"))
app.use(cookieParser())


import userRouter from './routes/user.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js";
import mealRouter from "./routes/meal.routes.js";
import mealPlanRouter from "./routes/mealPlan.routes.js";
import recommendationRouter from "./routes/recommendation.routes.js";
import feedbackRouter from "./routes/feedback.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import constraintRoutes from "./routes/constraint.routes.js";
import groceryRoutes from "./routes/grocery.routes.js";

// src/app.js
import { startWeeklySummaryCron } from "./services/cron/weeklySummary.cron.js";
import { retryFailedNotifications } from "./workers/notification.retry.js";

// start cron
startWeeklySummaryCron();
retryFailedNotifications();

// retry every 5 minutes
setInterval(retryFailedNotifications, 5 * 60 * 1000);


app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/meals", mealRouter);
app.use("/api/v1/meal-plans", mealPlanRouter);
app.use("/api/v1/recommendations", recommendationRouter);
app.use("/api/v1/feedback", feedbackRouter);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/constraints", constraintRoutes);
app.use("/api/v1", groceryRoutes);

import mlContractRoutes from "./routes/mlContract.routes.js";
app.use("/api", mlContractRoutes);

// Error handling middleware (must be last)
import errorMiddleware from "./middlewares/error.middleware.js";
app.use(errorMiddleware);

export { app }