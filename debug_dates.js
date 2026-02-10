
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const debugDates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const collection = mongoose.connection.db.collection('employee_logs');

        // Check a sample of imported logs
        const importedLogs = await collection.find({ employeeId: { $exists: false } }).limit(5).toArray();

        const output = [];

        output.push("--- IMPORTED LOGS DATE FIELDS ---");
        importedLogs.forEach(log => {
            output.push(`ID: ${log._id}, Date (key 'Date'): '${log.Date}', date (key 'date'): '${log.date}'`);
        });

        // Check standard logs
        const standardLogs = await collection.find({ employeeId: { $exists: true } }).limit(2).toArray();
        output.push("\n--- STANDARD LOGS DATE FIELDS ---");
        standardLogs.forEach(log => {
            output.push(`ID: ${log._id}, Date (key 'Date'): '${log.Date}', date (key 'date'): '${log.date}'`);
        });

        fs.writeFileSync('debug_dates_output.txt', output.join('\n'));
        console.log("Output written to debug_dates_output.txt");

        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

debugDates();
