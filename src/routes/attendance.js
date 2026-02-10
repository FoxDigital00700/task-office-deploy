import express from "express";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

const router = express.Router();

// Middleware to get current date string YYYY-MM-DD
const getTodayDate = () => {
    // Use local time instead of UTC to ensure days align with user's wall clock
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 1. Morning Login
router.post("/login", async (req, res) => {
    try {
        const { employeeId } = req.body;
        if (!employeeId) return res.status(400).json({ message: "Employee ID is required" });
        const today = getTodayDate();

        let attendance = await Attendance.findOne({ employeeId, date: today });

        if (attendance) {
            if (attendance.loginTime) {
                return res.status(400).json({ message: "Already logged in for today." });
            }
            attendance.loginTime = new Date();
            attendance.status = "Present";
            await attendance.save();
        } else {
            // Create new attendance record
            attendance = new Attendance({
                employeeId,
                date: today,
                loginTime: new Date(),
                status: "Present",
            });
            await attendance.save();
        }

        // Notify via Socket.IO
        if (req.io) {
            req.io.emit("attendanceUpdate", { type: "login", employeeId, attendance });
        }

        res.status(200).json({ message: "Logged in successfully", attendance });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 2. Lunch Start
router.post("/lunch-start", async (req, res) => {
    try {
        const { employeeId } = req.body;
        if (!employeeId) return res.status(400).json({ message: "Employee ID is required" });
        const today = getTodayDate();

        const attendance = await Attendance.findOne({ employeeId, date: today });
        if (!attendance) {
            return res.status(404).json({ message: "Attendance not found. Please log in first." });
        }

        if (attendance.lunchStartTime) {
            return res.status(400).json({ message: "Lunch already started." });
        }

        attendance.lunchStartTime = new Date();
        await attendance.save();

        if (req.io) {
            req.io.emit("attendanceUpdate", { type: "lunch-start", employeeId, attendance });
        }

        res.status(200).json({ message: "Lunch started", attendance });
    } catch (error) {
        console.error("Lunch Start Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 3. Lunch End (Come Back)
router.post("/lunch-end", async (req, res) => {
    try {
        const { employeeId } = req.body;
        const today = getTodayDate();

        const attendance = await Attendance.findOne({ employeeId, date: today });
        if (!attendance) {
            return res.status(404).json({ message: "Attendance not found." });
        }

        if (!attendance.lunchStartTime) {
            return res.status(400).json({ message: "You haven't gone for lunch yet." });
        }
        if (attendance.lunchEndTime) {
            return res.status(400).json({ message: "Lunch already ended." });
        }

        attendance.lunchEndTime = new Date();
        await attendance.save();

        if (req.io) {
            req.io.emit("attendanceUpdate", { type: "lunch-end", employeeId, attendance });
        }

        res.status(200).json({ message: "Back from lunch", attendance });
    } catch (error) {
        console.error("Lunch End Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 4. Logout
router.post("/logout", async (req, res) => {
    try {
        const { employeeId } = req.body;
        const today = getTodayDate();

        const attendance = await Attendance.findOne({ employeeId, date: today });
        if (!attendance) {
            return res.status(404).json({ message: "Attendance not found." });
        }

        if (attendance.logoutTime) {
            return res.status(400).json({ message: "Already logged out." });
        }

        const now = new Date();
        attendance.logoutTime = now;

        // Calculate total working hours
        // Total = (Logout - Login) - (Lunch End - Lunch Start)
        if (attendance.loginTime) {
            let totalMillis = now - new Date(attendance.loginTime);

            if (attendance.lunchStartTime && attendance.lunchEndTime) {
                const lunchMillis = new Date(attendance.lunchEndTime) - new Date(attendance.lunchStartTime);
                totalMillis -= lunchMillis;
            } else if (attendance.lunchStartTime && !attendance.lunchEndTime) {
                // Case where user forgot to click "Come Back"
                attendance.lunchEndTime = now;
                const lunchMillis = now - new Date(attendance.lunchStartTime);
                totalMillis -= lunchMillis;
            }

            const hours = totalMillis / (1000 * 60 * 60);
            attendance.totalWorkHours = parseFloat(hours.toFixed(2));
        }

        await attendance.save();

        if (req.io) {
            req.io.emit("attendanceUpdate", { type: "logout", employeeId, attendance });
        }

        res.status(200).json({ message: "Logged out successfully", attendance });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 5. Get Status for Employee (Self)
router.get("/status/:employeeId", async (req, res) => {
    try {
        const { employeeId } = req.params;
        const today = getTodayDate();

        const attendance = await Attendance.findOne({ employeeId, date: today });

        if (!attendance) {
            // Not logged in yet
            return res.json({ status: "Absent", loginTime: null, lunchStartTime: null, lunchEndTime: null, logoutTime: null });
        }

        res.json(attendance);
    } catch (error) {
        console.error("Status Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 6. Get All Attendance (For Admin)
router.get("/all", async (req, res) => {
    try {
        const today = getTodayDate();

        // 1. Get all employees (users with role != Super Admin maybe? depends on req. User request said "Display for every employee")
        // 1. Get all employees (Exclude Super Admin)
        const users = await User.find({ role: { $ne: "Super Admin" } }, "name employeeId email role designation workType joiningDate");

        // 2. Get all attendance records for today
        const attendanceRecords = await Attendance.find({ date: today });

        // 3. Merge data
        // Map user to their attendance status
        const report = users.map(user => {
            const att = attendanceRecords.find(a => a.employeeId.toString() === user._id.toString());
            return {
                _id: user._id,
                name: user.name,
                email: user.email, // Added email
                employeeId: user.employeeId,
                role: user.role, // This is Department in UI
                designation: user.designation, // This is Role in UI
                workType: user.workType,
                joiningDate: user.joiningDate, // Added joiningDate
                status: att ? att.status : "Absent",
                loginTime: att ? att.loginTime : null,
                lunchStartTime: att ? att.lunchStartTime : null,
                lunchEndTime: att ? att.lunchEndTime : null,
                logoutTime: att ? att.logoutTime : null,
                totalWorkHours: att ? att.totalWorkHours : 0
            };
        });

        res.json(report);
    } catch (error) {
        console.error("All Attendance Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});



// 7. Get Attendance History (For Admin - Grouped View)
// 7. Get Attendance History (For Admin - Grouped View)
router.get("/history", async (req, res) => {
    try {
        // 1. Fetch all employees (Exclude Super Admin)
        const users = await User.find({ role: { $ne: "Super Admin" } }, "name employeeId role email");

        // 2. Fetch all attendance records
        const attendanceRecords = await Attendance.find()
            .populate("employeeId", "name employeeId role email")
            .sort({ date: -1 });

        // 3. Extract unique dates from attendance records
        const uniqueDates = [...new Set(attendanceRecords.map(a => a.date))];

        // 4. Build the complete report
        let fullHistory = [];

        uniqueDates.forEach(date => {
            // Get records for this specific date
            const daysRecords = attendanceRecords.filter(a => a.date === date);

            // For each user, find their record or create a dummy "Absent" one
            users.forEach(user => {
                const record = daysRecords.find(a => a.employeeId && a.employeeId._id.toString() === user._id.toString());

                if (record) {
                    fullHistory.push(record);
                } else {
                    // Create virtual "Absent" record
                    fullHistory.push({
                        _id: `virtual-${date}-${user._id}`, // Unique ID for key
                        date: date,
                        employeeId: user, // Populated user object
                        status: "Absent",
                        loginTime: null,
                        logoutTime: null,
                        totalWorkHours: 0
                    });
                }
            });
        });

        // 5. Sort by date descending (and maybe by employee name/ID within date if needed)
        fullHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(fullHistory);
    } catch (error) {
        console.error("Attendance History Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
