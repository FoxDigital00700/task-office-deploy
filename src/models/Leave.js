import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    leaveCategory: { type: String, enum: ["Day Leave", "Hour Permission"], required: true },
    leaveType: { type: String, required: true }, // Sick Leave, Health Issue, etc.
    appliedDate: { type: String, required: true }, // YYYY-MM-DD
    leaveDate: { type: String }, // YYYY-MM-DD (Required if Day Leave)
    permissionDate: { type: String }, // YYYY-MM-DD (Required if Hour Permission)
    startTime: { type: String }, // HH:mm (Required if Hour Permission)
    endTime: { type: String }, // HH:mm (Required if Hour Permission)
    reason: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    rejectionReason: { type: String }, // Optional, only for Rejected status
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Leave", leaveSchema);
