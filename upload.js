const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

//limts 5mb
let fileSize = 5 * 1024 * 1024;

// allowed files
const fileFilter = (req, file, cb) => {
  const fileRegx = /jpeg|jpg|png|pdf/;
  const isAllowed = fileRegx.test(file.mimetype);
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error("only jpeg,png,pdf,jpg files allowed"), false);
  }
};

// storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./upload-Images");
  },
  filename: (req, file, cb) => {
    const extention = path.extname(file.originalname);
    // const imgName = `images/${Date.now()}-${Math.round(Math.random() * 1e9)}${extention}`;
    const imgName = `${uuidv4()}${extention}`;
    cb(null, imgName);
  },
});

exports.upload = multer({
  storage,
  limits: {
    fileSize,
  },
  fileFilter,
});
