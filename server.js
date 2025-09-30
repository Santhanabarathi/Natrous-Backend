const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const app = require("./app");

const DB = process.env.DATABASE;
mongoose
  .connect(DB, {})
  .then(() => {
    console.log("DB connected successfull");
  })
  .catch((err) => console.log("DB connection error:", err));

const port = 3002;

app.listen(port, () => {
  console.log(`running on port ${port}`);
});
