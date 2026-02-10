import express from 'express';
import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import mongoose from 'mongoose';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Create storage engine
const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({ storage });

// Init GridFS Bucket
let gfsBucket;
const conn = mongoose.connection;
conn.once('open', () => {
    gfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
    console.log("GridFS Bucket Initialized");
});

// Route: POST /api/upload
router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Generate Absolute URL so it works across ports
    const protocol = req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/api/upload/files/${req.file.filename}`;

    res.json({
        fileUrl: fileUrl,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        size: req.file.size,
        id: req.file.id
    });
});

// Route: GET /api/upload/files/:filename
router.get('/files/:filename', async (req, res) => {
    try {
        if (!gfsBucket) {
            return res.status(500).json({ message: "Database not ready" });
        }

        const file = await conn.db.collection('uploads.files').findOne({ filename: req.params.filename });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Check if image or other type to set headers
        if (file.contentType) {
            res.set('Content-Type', file.contentType);
        }

        const readStream = gfsBucket.openDownloadStreamByName(req.params.filename);
        readStream.pipe(res);

    } catch (err) {
        console.error("File Retreival Error:", err);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
