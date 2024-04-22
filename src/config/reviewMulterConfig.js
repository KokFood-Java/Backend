const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../images/review"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `review_pict_${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images are allowed."), false);
  }
};

const menuUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
}).single("review_pict");

module.exports = menuUpload;
