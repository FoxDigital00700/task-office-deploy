import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        date: {
            type: String, // Format: YYYY-MM-DD
            required: true,
        },
        loginTime: {
            type: Date,
            default: null,
        },
        lunchStartTime: {
            type: Date,
            default: null,
        },
        lunchEndTime: {
            type: Date,
            default: null,
        },
        logoutTime: {
            type: Date,
            default: null,
        },
        status: {
            type: String,
            enum: ["Present", "Absent", "Half Day", "On Leave"],
            default: "Absent",
        },
        totalWorkHours: {
            type: Number, // In hours (e.g. 8.5)
            default: 0,
        },
    },
    { timestamps: true }
);

// Ensure one entry per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
