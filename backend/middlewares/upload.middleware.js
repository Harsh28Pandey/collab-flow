const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {

    const allowedTypes = [

        // Images
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",

        // Videos
        "video/mp4",
        "video/mkv",
        "video/webm",
        "video/quicktime",

        // PDF
        "application/pdf",

        // Docs
        "application/msword",

        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        // Excel
        "application/vnd.ms-excel",

        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        // Text
        "text/plain",

        // Zip
        "application/zip",
        "application/x-zip-compressed",
    ];

    if (allowedTypes.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "Unsupported file type"
            ),
            false
        );
    }
};

const upload = multer({

    storage,

    limits: {
        fileSize: 100 * 1024 * 1024,
    },

    fileFilter,
});

module.exports = upload;


// const multer = require("multer");

// //* memory storage for vercel
// const storage = multer.memoryStorage();

// //* file filter
// const fileFilter = (req, file, cb) => {

//     const allowedTypes = [
//         "image/jpeg",
//         "image/png",
//         "image/jpg",
//         "image/webp"
//     ];

//     if (allowedTypes.includes(file.mimetype)) {
//         cb(null, true);
//     } else {
//         cb(
//             new Error(
//                 "Only jpeg, jpg, png and webp are allowed"
//             ),
//             false
//         );
//     }

// };

// const upload = multer({
//     storage,
//     fileFilter,
//     limits: {
//         fileSize: 5 * 1024 * 1024
//     }
// });

// module.exports = upload;



//* only works on localhost not production ready
// const multer = require("multer");

// //* configure storage
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads');
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     }
// });

// //* file filter
// const fileFilter = (req, file, cb) => {
//     const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
//     if (allowedTypes.includes(file.mimetype)) {
//         cb(null, true);
//     } else {
//         cb(new Error('Only .jpeg, .jpg and .png formats are allowed'), false);
//     }
// };

// const upload = multer({ storage, fileFilter });

// module.exports = upload;