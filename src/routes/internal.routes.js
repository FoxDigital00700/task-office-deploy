import express from "express";
import { createTaskBranch, endSession } from "../controllers/internal.controller.js";

const router = express.Router();

// Create Branch
router.post('/create-branch', createTaskBranch);

// End Session
router.post('/end-session', endSession);

export default router;
