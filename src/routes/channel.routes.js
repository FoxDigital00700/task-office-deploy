import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
    getChannels,
    createChannel,
    deleteChannel,
    renameChannel,
    addMember,
    removeMember
} from '../controllers/channelController.js';

const router = express.Router();

// GET all channels (Global + Private/Team if allowed)
router.get('/', verifyToken, getChannels);

// POST create channel (Super Admin)
router.post('/', verifyToken, createChannel);

// DELETE channel (Super Admin)
router.delete('/:id', verifyToken, deleteChannel);

// PUT rename channel (Super Admin)
router.put('/:id', verifyToken, renameChannel);

// POST add member (Super Admin / Manager)
router.post('/:id/members', verifyToken, addMember);

// DELETE remove member (Super Admin / Manager)
router.delete('/:id/members/:userId', verifyToken, removeMember);

export default router;
