import express from "express";
import multer from "multer";
import { createTask, getInvitations, respondToTask, getMyTasks, downloadFile, getTasksByEmployee, getAllTasks, getDashboardStats, updateTaskStatus } from "../controllers/taskController.js";
import path from "path";
import fs from "fs";

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

router.post("/", upload.fields([{ name: "documents" }, { name: "audioFile" }]), createTask);
router.get("/stats", getDashboardStats);
router.get("/all", getAllTasks);
router.get("/my-invitations", getInvitations);
router.get("/my-tasks", getMyTasks);
router.get("/download/:filename", downloadFile);
router.get("/employee/:employeeId", getTasksByEmployee);
router.post("/:id/respond", respondToTask);
router.put("/:id/status", updateTaskStatus);

export default router;
