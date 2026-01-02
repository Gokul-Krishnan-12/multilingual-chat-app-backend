import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const Connection = async () => {
  const URL =
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@chat-app.ysb3zc2.mongodb.net/?appName=chat-app`;
  try {
    await mongoose.connect(URL);
    console.log("connected to DB");
  } catch (error) {
    console.log(error.message)
  }
};
export default Connection;