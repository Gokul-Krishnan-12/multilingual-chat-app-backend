import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  provider: { type: String, enum: ["google", "credentials"] },
  name: String,
  image: String
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
