
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const debugData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const collection = mongoose.connection.db.collection('employee_logs');

        // Fetch logs with Time Estimaion
        const logs = await collection.find({ "Time Estimaion": { $exists: true } }).limit(10).toArray();
        const noDateLogs = await collection.find({ $or: [{ Date: { $exists: false } }, { Date: null }, { Date: "undefined" }, { date: "undefined" }] }).limit(5).toArray();

        const output = [];
        output.push("--- TIME ESTIMATION FORMATS ---");
        logs.forEach(log => {
            output.push(`ID: ${log._id}, Time Estimaion: '${log["Time Estimaion"]}'`);
        });

        output.push("\n--- LOGS WITH POTENTIALLY INVALID DATES ---");
        noDateLogs.forEach(log => {
            output.push(`ID: ${log._id}, Date: '${log.Date}', date: '${log.date}'`);
        });

        fs.writeFileSync('debug_data_output.txt', output.join('\n'));
        console.log("Output written to debug_data_output.txt");

        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

debugData();
