import multer from "multer";
import path from "path";

const storage = (subfolder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `./src/assets/${subfolder}`);
    },
    filename: (req, file, cb) => {
      cb(
        null,
        `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
      );
    },
  });

const upload = (subfolder) => multer({ storage: storage(subfolder) });

export default upload;
