import express from "express";
import healthCheckRouter from "./routes/healthcheck.routes.js";
import communityRouter from "./routes/community.routes.js";
import authRouter from "./routes/auth.routes.js";
import postRouter from "./routes/post.routes.js";
import commentRouter from "./routes/comment.routes.js";
import voteRouter from "./routes/votes.routes.js";
import savedPostRouter from "./routes/savedPost.routes.js";
import userRouter from "./routes/user.routes.js";
import reportRouter from "./routes/report.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { apiRateLimiter } from "./middlewares/rateLimit.middleware.js";

const app = express();

//basic config
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use("/api/v1", apiRateLimiter);
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/communities", communityRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/votes", voteRouter);
app.use("/api/v1/savedPost", savedPostRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reports", reportRouter);

//global Error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export { app };
