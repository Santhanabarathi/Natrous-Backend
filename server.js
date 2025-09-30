// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// dotenv.config({ path: "./.env" });
// const app = require("./app");

// mongoose.connect("mongodb://127.0.0.1:27017/natrous", {}).then(() => {
//   console.log("DB connected succesfully");
// });

// const DB = process.env.DATABASE;
// mongoose.connect(DB, {}).then(() => {
//   console.log("DB connected successfull");
// });

// const port = 3002;

// app.listen(port, () => {
//   console.log(`running on port ${port}`);
// });

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const app = require("./app");

const DB = process.env.DATABASE;

// Cache connection for serverless
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("Using existing database connection");
    return;
  }

  try {
    await mongoose.connect(DB, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log("DB connected successfully");
  } catch (err) {
    console.error("DB Connection Error:", err);
  }
};

// Initialize connection
connectDB();

// Export for Vercel - NO app.listen()!
module.exports = app;
