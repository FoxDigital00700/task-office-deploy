import Channel from "../models/Channel.js";
import User from "../models/User.js";

import Message from "../models/Message.js";

// @desc    Create a branch for a task (Internal API)
// @route   POST /api/internal/create-branch
// @access  Internal
export const createTaskBranch = async (req, res) => {
    try {
        const { departmentName, taskTitle, members, taskId } = req.body;

        console.log('Internal Create Branch Request:', req.body);

        if (!departmentName || typeof departmentName !== 'string') {
            return res.status(400).json({ message: "Invalid departmentName" });
        }

        // 1. Find Parent Channel (Department)
        // Try variants: Original, Hyphenated, Spaced
        const variants = [
            departmentName,
            departmentName.replace(/\s+/g, '-'), // "SM SEO Specialist" -> "SM-SEO-Specialist"
            departmentName.replace(/-/g, ' ')    // "SM-SEO-Specialist" -> "SM SEO Specialist"
        ];
        // Deduplicate
        const uniqueVariants = [...new Set(variants)];

        let parentChannel = await Channel.findOne({
            name: { $in: uniqueVariants.map(v => new RegExp(`^${v}$`, 'i')) },
            parent: null // Ensure it's a top-level channel
        });

        if (!parentChannel) {
            console.log(`Parent channel '${departmentName}' not found. Creating...`);
            parentChannel = new Channel({
                name: departmentName,
                type: 'Global', // Making it global for Department roots
                description: `Department Channel for ${departmentName}`,
                allowedUsers: []
            });
            await parentChannel.save();
        }

        // 2. Use Task ID as Branch Name
        const branchName = taskId; // Use the provided Task ID directly

        // 3. Resolve Members (User IDs)
        // Input `members` is array of User IDs from Task Manager. 
        // We assume they match Office Sync User IDs (Monolithic repo/shared DB logic).
        const validMembers = [];
        if (members && Array.isArray(members)) {
            for (const memberId of members) {
                // Check if valid ObjectId
                if (memberId.match(/^[0-9a-fA-F]{24}$/)) {
                    const user = await User.findById(memberId);
                    if (user) {
                        validMembers.push(user._id);
                        // Auto-add to Parent Channel if not present
                        if (!parentChannel.allowedUsers.includes(user._id)) {
                            parentChannel.allowedUsers.push(user._id);
                            await parentChannel.save();
                        }
                    }
                }
            }
        }

        // 4. Create Branch
        // Inherit visibility: Include all users from the Parent Department Channel
        const parentMembers = parentChannel.allowedUsers.map(id => id.toString());
        const finalMembers = [...new Set([...validMembers.map(id => id.toString()), ...parentMembers])];

        const newBranch = new Channel({
            name: branchName,
            type: 'Team', // or 'Task' if you have that type
            description: `Task: ${taskTitle} (ID: ${taskId})`,
            parent: parentChannel._id,
            allowedUsers: finalMembers
        });

        await newBranch.save();

        // 5. Start Session Automatically
        // Determine sender: Use the first member (acceptor) or a system/admin user if available.
        // For simplicity, if validMembers has items, use the first one. Else, use null/system.
        const sessionStarter = validMembers.length > 0 ? validMembers[0] : null;

        const sessionStartMsg = new Message({
            channel: newBranch._id,
            content: 'Session Started',
            type: 'session_start',
            sender: sessionStarter // Can be null if no members, check Message model if required
        });
        await sessionStartMsg.save();


        // 6. Return Result
        // Construct Link: http://localhost:5174/chat/<branchId>
        // Initialize Chat URL
        // Construct Link: http://localhost:5500/chat/<branchId>
        // In production, use process.env.CLIENT_URL
        const clientBaseUrl = process.env.CLIENT_URL || 'https://office-sync-frontend.netlify.app'; // Updated fallback
        const chatUrl = `${clientBaseUrl}/chat/${newBranch._id}`;

        res.status(201).json({
            message: "Task Branch Created",
            branchId: newBranch._id,
            channelName: newBranch.name,
            chatUrl: chatUrl
        });

    } catch (err) {
        console.error("Internal Create Branch Error:", err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// @desc    End Session (Archive/Close)
// @route   POST /api/internal/end-session
export const endSession = async (req, res) => {
    try {
        const { branchId, taskId, userId } = req.body; // Added userId

        let branch;
        if (branchId) {
            branch = await Channel.findById(branchId);
        } else if (taskId) {
            branch = await Channel.findOne({ name: taskId });
        }

        if (!branch) return res.status(404).json({ message: "Branch not found" });

        // Archive the branch (Stop Session)
        branch.status = 'Archived';

        // Create "Session Ended" message
        // Use provided userId or fallback to a known system/admin if possible. 
        // For now, assume userId is provided. If not, maybe use the first allowedUser?
        let senderId = userId;
        if (!senderId && branch.allowedUsers && branch.allowedUsers.length > 0) {
            senderId = branch.allowedUsers[0]; // Fallback to first member
        }

        const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:5500';
        let chatUrl = `${clientBaseUrl}/chat/${branch._id}`; // Default fallback

        if (senderId) {
            const endMsg = new Message({
                channel: branch._id,
                content: 'Session Ended by Task Completion',
                type: 'session_end', // Changed to 'session_end' to match client logic
                sender: senderId
            });
            await endMsg.save();

            // Find the last Session Start message to construct the history link
            const startMsg = await Message.findOne({
                channel: branch._id,
                type: 'session_start'
            }).sort({ createdAt: -1 });

            if (startMsg) {
                // Construct Session History URL
                // Format: CLIENT_URL/session/:channelId/:startMsgId/:endMsgId
                chatUrl = `${clientBaseUrl}/session/${branch._id}/${startMsg._id}/${endMsg._id}`;
            }
        } else {
            console.warn("No senderId available for session end message. Skipping message creation.");
        }

        await branch.save();

        res.json({
            success: true,
            chatUrl: chatUrl
        });

    } catch (err) {
        console.error("End Session Error:", err);
        res.status(500).json({
            message: "Server Error",
            error: err.message,
            stack: err.stack
        });
    }
};
