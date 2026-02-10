
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import WorkLog from './src/models/WorkLog.js';

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Fetch a few records where taskOwner exists to see their structure
        const logs = await WorkLog.find({ taskOwner: { $exists: true, $ne: "" } }).limit(5);

        console.log("Found logs with Task Owner:");
        logs.forEach(log => {
            console.log(JSON.stringify(log, null, 2));
        });

        // Check if there are logs with NO employeeId
        const noEmployeeId = await WorkLog.countDocuments({ employeeId: { $exists: false } });
        console.log(`Logs with missing employeeId: ${noEmployeeId}`);

        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkData();
