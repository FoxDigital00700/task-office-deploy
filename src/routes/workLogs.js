import express from "express";
import multer from "multer";
import { createWorkLog, getWorkLogsByEmployee, getAllWorkLogs, updateWorkLog, getFilterOptions, getDailyTaskCount } from "../controllers/workLogController.js";
import path from "path";
import fs from "fs";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = "uploads/";
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// CREATE LOG
router.post("/", upload.fields([{ name: "document" }, { name: "audio" }]), createWorkLog);

// GET ALL LOGS
router.get("/", getAllWorkLogs);

// GET LOGS BY EMPLOYEE
router.get("/employee/:id", getWorkLogsByEmployee);

// GET FILTER OPTIONS
router.get("/filters", getFilterOptions);

// GET DAILY TASK COUNT
router.get("/count", verifyToken, getDailyTaskCount);

// UPDATE LOG STATUS
router.put("/:id", updateWorkLog);

export default router;
