import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { UserRouter } from "./routes/user.js";
import cookieParser from "cookie-parser";

dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}));
app.use(cookieParser())
app.use("/auth", UserRouter);

// MongoDB connection string (adjust the database name)
const mongoURL = 'mongodb://localhost:27017/login-auth'; // Replace with your Compass connection string

// Connect to MongoDB
mongoose.connect(mongoURL, {
    serverSelectionTimeoutMS: 30000, // Adjust timeout if necessary
})
.then(() => {
    console.log("Connected to MongoDB");
})
.catch((err) => {
    console.error("Failed to connect to MongoDB", err);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
