import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const generateChatToken = async (req, res) => {
    try {
        // Assuming middleware has already populated req.user or we use session
        // Since original auth.js didn't use JWT middleware on all routes, we might need to rely on req.user if available
        // OR if this route is called from frontend with some ID. 
        // BUT safest is to assume the user is logged in and we have their ID from a trusted source (e.g. session or existing simple token)

        // However, looking at authMiddleware.js, it verifies a token. 
        // If the frontend has a token for Task Manager (even if not fully used everywhere), we can use it.
        // Let's assume the request comes authenticated via the existing authMiddleware.

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const payload = {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.designation ? [user.designation, ...(Array.isArray(user.role) ? user.role : [user.role])] : user.role,
            employeeId: user.employeeId
        };

        // Sign with the SHARED secret
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5m" }); // Short lived token for handoff

        res.json({ token });
    } catch (error) {
        console.error("Chat Token Generation Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, 'name email role designation employeeId');
        res.json(users);
    } catch (error) {
        console.error("Get All Users Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
