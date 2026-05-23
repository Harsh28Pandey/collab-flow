const multer = require("multer");

//* memory storage for vercel
const storage = multer.memoryStorage();

//* file filter
const fileFilter = (req, file, cb) => {

    ```
const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp"
];

if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
} else {
    cb(
        new Error(
            "Only jpeg, jpg, png and webp are allowed"
        ),
        false
    );
}
```

};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;



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