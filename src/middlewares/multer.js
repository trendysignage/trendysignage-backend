import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const vendorId = req.token.vendor._id;
    const mediaType = file.mimetype.split("/")[0];
    const dest = `public/${vendorId}/${mediaType}`;

    // create the destination folder if it doesn't exist
    if (!fs.existsSync(dest)) {
      // create the destination folder (and any parent folders) if it doesn't exist
      fs.mkdir(dest, { recursive: true }, (err) => {
        if (err) {
          console.error("Error creating destination folder:", err);
        }
        cb(null, dest);
      });
    } else {
      cb(null, dest);
    }
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
});

export default upload;
