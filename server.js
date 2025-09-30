const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const app = require("./app");

// mongoose.connect("mongodb://127.0.0.1:27017/natrous", {}).then(() => {
//   console.log("DB connected succesfully");
// });

const DB = process.env.DATABASE;
mongoose.connect(DB, {}).then(() => {
  console.log("DB connected successfull");
});

const port = 3002;

app.listen(port, () => {
  console.log(`running on port ${port}`);
});
