import { app } from "./app.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";

const PORT = process.env.PORT || 3000;

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed!", err);
    process.exit(1);
  });
