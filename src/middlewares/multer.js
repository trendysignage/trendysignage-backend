import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  // fileFilter: (req, file, cb) => {
  //   if (
  //     file.mimetype === "image/png" ||
  //     file.mimetype === "image/jpg" ||
  //     file.mimetype === "image/jpeg" ||
  //     file.mimetype === "video/mp4"
  //   ) {
  //     cb(null, true);
  //   } else {
  //     cb(null, false);
  //     return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
  //   }
  // },
});

export default upload;
