import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const { app } = await import("./app.js");
const { default: connectDB } = await import("./db/index.js");

const PORT = process.env.PORT || 3000;

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
