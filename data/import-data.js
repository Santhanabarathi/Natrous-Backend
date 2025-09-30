const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const Tour = require("../models/tourSchema");

const DB = process.env.DATABASE;
mongoose.connect(DB, {}).then(() => {
  console.log("DB connected successfull");
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tour.json`));

const importData = async () => {
  try {
    await Tour.create(tours);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

console.log(process.argv);

if (process.argv[2] === "--import") {
  console.log("data imported");
  importData();
} else if (process.argv[2] === "--delete") {
  console.log("data deleted");
  deleteData();
}
// node ./data/import-data.js --import
