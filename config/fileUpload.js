import multer from "multer";
import cloudinary from "./cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
// import path from 'path'

// const storage = multer.diskStorage({
//     destination: function(req, file, cb){
//         cb(null, 'uploads/')
//     },

//     filename: function(req, file, cb){
//         const uniqueName = Date.now() + '-' + file.originalname;
//         cb(null, uniqueName)
//     }
// });

// Validate file type

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /jpeg|jpg|png/;
//   const ext = path.extname(file.originalname).toLowerCase();
//   if (allowedTypes.test(ext)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only .jpeg, .jpg and .png formats are allowed"));
//   }
// };

// export const fileUpload = multer({storage, fileFilter})


const storage = new CloudinaryStorage({cloudinary,
  params: {
    folder: "shift_assets",
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
  },
});

export const fileUpload = multer({storage})