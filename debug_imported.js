
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import WorkLog from './src/models/WorkLog.js';

dotenv.config();

const debugImported = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Find logs MISSING employeeId
        const imported = await WorkLog.find({ employeeId: { $exists: false } }).limit(5);

        console.log("--- IMPORTED LOGS SAMPLE ---");
        if (imported.length === 0) {
            console.log("No logs missing employeeId found.");
        } else {
            console.log("Found logs missing employeeId:", imported.length);
            imported.forEach((log, i) => {
                console.log(`[${i}] ID: ${log._id}, Owner: '${log.taskOwner}' (type: ${typeof log.taskOwner})`);
            });
        }

        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

debugImported();
