import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
dotenv.config({
  path: './.env'
})

const app = express()

const allowedOrigins = [
  process.env.CORS_ORIGIN || "https://smart-bite-woad.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))
app.use(express.static("public"))
app.use(cookieParser())


import userRouter from './routes/user.routes.js'
import adminRouter from './routes/admin.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js";

app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);

export { app }