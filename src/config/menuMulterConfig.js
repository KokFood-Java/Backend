const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../images/menu"));
  },
  filename: (req, file, cb) => {
    const menu_name = req.body.menu_name.replace(/\s+/g, "_");
    const ext = path.extname(file.originalname);
    const filename = `menu_pict_${menu_name}${ext}`;
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
}).single("menu_pict");

module.exports = menuUpload;
