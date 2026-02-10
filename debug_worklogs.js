
import "dotenv/config";
import mongoose from "mongoose";
import WorkLog from "./src/models/WorkLog.js";
import User from "./src/models/User.js";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("Connection Error:", error);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();

    try {
        console.log("Fetching all logs...");
        const logs = await WorkLog.find({}).sort({ createdAt: -1 }).populate("employeeId", "name email role employeeId");
        console.log(`Found ${logs.length} logs.`);

        if (logs.length > 0) {
            console.log("First log sample:", JSON.stringify(logs[0], null, 2));
        } else {
            console.log("No logs found. Checking raw count...");
            const count = await WorkLog.countDocuments({});
            console.log(`Total documents in WorkLog collection: ${count}`);
        }

        // Check for invalid logs (missing projectName)
        const invalidLogs = await WorkLog.find({ projectName: { $exists: false } });
        if (invalidLogs.length > 0) {
            console.log(`Found ${invalidLogs.length} logs missing 'projectName'.`);
            // Optionally clean them up? No, just report.
            invalidLogs.forEach(log => console.log(`Invalid Log ID: ${log._id}`));
        } else {
            console.log("No logs missing 'projectName' found via query.");
        }

    } catch (error) {
        console.error("Error fetching logs:", error);
    } finally {
        mongoose.connection.close();
    }
};

run();
