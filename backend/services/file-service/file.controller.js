import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const fc = {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, "../../uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const mimeType = {
    ".ico": "image/x-icon",
    ".html": "text/html",
    ".js": "text/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpg",
    ".jpeg": "image/jpeg",
    ".wav": "audio/wav",
    ".mp3": "audio/mpeg",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".eot": "application/vnd.ms-fontobject",
    ".ttf": "application/font-sfnt",
    ".gif": "image/gif",
    ".jfif": "image/jpeg",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".rar": "application/x-rar-compressed",
    ".zip": "application/zip",
    ".7z": "application/x-7z-compressed",
    ".htm": "text/html",
    ".txt": "text/plain"
};


fc.uploadFiles = asyncHandler (async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json(new ApiError(400, "No files uploaded"));
        }

        let files = Array.isArray(req.files.file) ? req.files.file : [req.files.file];
        const uploadedFiles = [];

        await Promise.all(files.map(async (file) => {
            if (file.size > MAX_FILE_SIZE) {
                throw new ApiError(400, `File size should not exceed 5MB`);
            }

            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 9);
            const ext = path.extname(file.name).toLowerCase();
            const base = path.basename(file.name, path.extname(file.name)).replace(/[^a-zA-Z0-9]/g, "_");
            const safeName = `${timestamp}_${randomStr}_${base}${ext}`;
            const targetPath = path.join(UPLOAD_DIR, safeName);

            try {
                await file.mv(targetPath);
                uploadedFiles.push(safeName);
            } catch (error) {
                console.error("File handling error:", error);
                throw new ApiError(400, `Error processing file: ${file.name}`);
            }
        }));

        return res.status(201).json(new ApiResponse(201, { filenames: uploadedFiles }, "File(s) uploaded successfully!"));

    } catch (error) {
        console.error("Handler error:", error);
        return res.status(400).json(new ApiError(400, error));
    }
})


fc.getFile = asyncHandler (async (req, res) => {
    try {
        const filename = path.basename(req.params.filename);
        const directoryPath = path.join(UPLOAD_DIR, filename);

        if (!fs.existsSync(directoryPath)) {
            return res.status(404).json(new ApiError(404, `File ${filename} not found!`));
        }

        // Use res.sendFile for better handling of headers, ranges, and caching
        res.sendFile(directoryPath, (err) => {
            if (err) {
                 console.error("File sending error:", err);
                 if (!res.headersSent) {
                    res.status(500).json(new ApiError(500, "Error sending file"));
                 }
            }
        });
    } catch (error) {
        console.error("File retrieval error:", error);
        return res.status(500).json(new ApiError(500, error, `Error retrieving file: ${error.message}`));
    }
})


export default fc