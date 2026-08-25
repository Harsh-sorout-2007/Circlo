import mongoose from "mongoose";

const connectDB = async (req, res) => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB connection successfull ✅");
  } catch (error) {
    console.log("MongoDB connection failed ❌");
    process.exit(1);
  }
};

export default connectDB;
