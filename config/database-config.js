import mongoose from "mongoose";

export const connectDB = async () => {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is missing. Add it to backend/.env before starting the server."
    );
  }

  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB connected");
};
