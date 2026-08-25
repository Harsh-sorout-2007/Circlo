import express from "express";
import healthCheckRouter from "./routes/healthcheck.routes.js";

const app = express();

//basic config
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.use("/api/v1/healthcheck", healthCheckRouter);

export { app };
