const express = require("express");

const router = express.Router();

const upload = require("../middlewares/upload.middleware.js");

const { uploadFile, getProjectFiles, deleteFile, } = require("../controllers/file.controller.js");

const { protect } = require("../middlewares/auth.middleware.js");

router.post("/upload", protect, upload.single("file"), uploadFile);
router.get("/project/:projectId", protect, getProjectFiles);
router.delete("/:fileId", protect, deleteFile);

module.exports = router;