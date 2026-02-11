import Channel from '../models/Channel.js';
import User from '../models/User.js';

// Get all channels
export const getChannels = async (req, res) => {
    try {
        let query = {};

        // If not Super Admin, restrict access (Managers now treated like Users for visibility)
        if (!req.user.role.includes('Super Admin') && !req.user.role.includes('Admin')) {
            query = {
                $or: [
                    { allowedUsers: req.user._id },
                    { type: 'Global', allowedUsers: { $size: 0 } }
                ]
            };

            // Allow Managers to see 'Offline History'
            if (req.user.role.includes('Manager')) {
                if (!query.$or) query.$or = [];
                query.$or.push({ name: 'Offline History' });
            }
        }

        const channels = await Channel.find(query)
            .populate('allowedUsers', 'name email')
            .sort({ createdAt: 1 });
        res.json(channels);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Create a new channel
export const createChannel = async (req, res) => {
    // RBAC Limit: Only Super Admins can create channels
    if (!req.user.role.includes('Super Admin') && !req.user.role.includes('Admin')) {
        return res.status(403).json({ message: 'Access Denied: Super Admins only' });
    }

    const { name, type, description, parentId } = req.body;

    try {
        const newChannel = new Channel({
            name,
            type: type || 'Global',
            description,
            parent: parentId || null
        });

        const channel = await newChannel.save();
        res.json(channel);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete a channel (Recursive)
export const deleteChannel = async (req, res) => {
    try {
        const channel = await Channel.findById(req.params.id);
        if (!channel) return res.status(404).json({ message: 'Channel not found' });

        // Super Admin: All access. Manager: Only if member.
        if (!req.user.role.includes('Super Admin') && !req.user.role.includes('Admin')) {
            const isMember = channel.allowedUsers.some(u => u.toString() === req.user._id);
            if ((!req.user.role.includes('Manager') && !req.user.role.includes('Tech Lead')) || !isMember) {
                return res.status(403).json({ message: 'Access Denied' });
            }
        }

        // Recursive Deletion Helper
        const deleteRecursive = async (channelId) => {
            // Find children
            const children = await Channel.find({ parent: channelId });
            for (const child of children) {
                await deleteRecursive(child._id); // Recurse
            }
            // Delete self
            await Channel.findByIdAndDelete(channelId);
        };

        await deleteRecursive(req.params.id);

        res.json({ message: 'Channel and sub-branches removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Rename a channel
export const renameChannel = async (req, res) => {
    try {
        const channel = await Channel.findById(req.params.id);
        if (!channel) return res.status(404).json({ message: 'Channel not found' });

        // Super Admin: All access. Manager: Only if member.
        if (!req.user.role.includes('Super Admin') && !req.user.role.includes('Admin')) {
            const isMember = channel.allowedUsers.some(u => u.toString() === req.user._id);
            if ((!req.user.role.includes('Manager') && !req.user.role.includes('Tech Lead')) || !isMember) {
                return res.status(403).json({ message: 'Access Denied' });
            }
        }

        channel.name = req.body.name;
        await channel.save();
        res.json(channel);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Add Member
export const addMember = async (req, res) => {
    try {
        const channel = await Channel.findById(req.params.id);
        if (!channel) return res.status(404).json({ message: 'Channel not found' });

        // Super Admin: All access. Manager: Only if member.
        if (!req.user.role.includes('Super Admin') && !req.user.role.includes('Admin')) {
            const isMember = channel.allowedUsers.some(u => u.toString() === req.user._id);
            if ((!req.user.role.includes('Manager') && !req.user.role.includes('Tech Lead')) || !isMember) {
                return res.status(403).json({ message: 'Access Denied' });
            }
        }

        let userToAdd;
        const input = req.body.userId; // Can be ID, email, or name

        // 1. Try by ID
        if (input.match(/^[0-9a-fA-F]{24}$/)) {
            userToAdd = await User.findById(input);
        }

        // 2. Try by Email
        if (!userToAdd) {
            userToAdd = await User.findOne({ email: input });
        }

        // 3. Try by Name
        if (!userToAdd) {
            userToAdd = await User.findOne({ name: new RegExp('^' + input + '$', "i") });
        }

        if (!userToAdd) {
            return res.status(404).json({ message: `User '${input}' not found` });
        }

        // Check if already member
        const isAlreadyMember = channel.allowedUsers.some(u => u.toString() === userToAdd._id.toString());
        if (isAlreadyMember) {
            return res.status(400).json({ message: 'User already in channel' });
        }

        channel.allowedUsers.push(userToAdd._id);
        await channel.save();
        res.json(channel);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Remove Member
export const removeMember = async (req, res) => {
    try {
        const channel = await Channel.findById(req.params.id);
        if (!channel) return res.status(404).json({ message: 'Channel not found' });

        // Super Admin: All access. Manager: Only if member.
        if (!req.user.role.includes('Super Admin') && !req.user.role.includes('Admin')) {
            const isMember = channel.allowedUsers.some(u => u.toString() === req.user._id);
            if ((!req.user.role.includes('Manager') && !req.user.role.includes('Tech Lead')) || !isMember) {
                return res.status(403).json({ message: 'Access Denied' });
            }
        }

        channel.allowedUsers = channel.allowedUsers.filter(
            user => user.toString() !== req.params.userId
        );
        await channel.save();
        res.json(channel);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
