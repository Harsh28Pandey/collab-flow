const File = require("../models/file.model.js");

const imagekit = require("../config/imagekit.js");

const getFileType = (mimeType) => {

    if (mimeType.startsWith("image/")) {
        return "image";
    }

    if (mimeType.startsWith("video/")) {
        return "video";
    }

    if (mimeType === "application/pdf") {
        return "pdf";
    }

    return "document";
};

exports.uploadFile = async (req, res) => {

    try {

        const { title, projectId } = req.body;

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "File missing",
            });
        }

        // Upload to ImageKit
        const uploadedFile =
            await imagekit.upload({

                file:
                    req.file.buffer,

                fileName:
                    Date.now() +
                    "-" +
                    req.file.originalname,

                folder:
                    "/collab-flow-files",
            });

        // Save to DB
        const newFile = await File.create({

            title,

            originalName:
                req.file.originalname,

            fileUrl:
                uploadedFile.url,

            publicId:
                uploadedFile.fileId,

            fileType:
                getFileType(
                    req.file.mimetype
                ),

            mimeType:
                req.file.mimetype,

            size:
                req.file.size,

            project:
                projectId,

            uploadedBy:
                req.user._id,
        });

        const populatedFile =
            await File.findById(
                newFile._id
            ).populate(
                "uploadedBy",
                "name email profileImageUrl role"
            );

        res.status(201).json({

            success: true,

            file: populatedFile,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getProjectFiles = async (req, res) => {

    try {

        const files = await File.find({

            project:
                req.params.projectId,

        })
            .populate(
                "uploadedBy",
                "name email profileImageUrl role"
            )
            .sort({
                createdAt: -1,
            });

        res.status(200).json({

            success: true,

            files,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.deleteFile = async (req, res) => {

    try {

        const file =
            await File.findById(
                req.params.fileId
            );

        if (!file) {

            return res.status(404).json({
                success: false,
                message: "File not found",
            });
        }

        // Delete from ImageKit
        await imagekit.deleteFile(
            file.publicId
        );

        // Delete from DB
        await File.findByIdAndDelete(
            file._id
        );

        res.status(200).json({

            success: true,

            message:
                "File deleted successfully",
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};