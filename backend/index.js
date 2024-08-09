import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./db/mongodb.js";
import cors from "cors";
import AppError from "./utils/AppError.js";
import authRoutes from "./routes/auth.routes.js";
import pollRoutes, { testingMiddleware } from "./routes/poll.routes.js";
import globalErrorHandler from "./controllers/error.controller.js";
import VoteRecordRoutes from "./routes/voteRecords.routes.js";
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

connectDB();

app.use("/api/v1/poll", pollRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/vote-record", VoteRecordRoutes);
app.use("*", (req, res, next) => {
  next(new AppError("This route does not exist, get lost nigga 🤡", 404));
});
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}, pushing to heroku...`);
});
