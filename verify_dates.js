
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import WorkLog from './src/models/WorkLog.js';
import fs from 'fs';

dotenv.config();

// Copied helper from controller to verify logic
const normalizeDate = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
    const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
    if (match) {
        const [_, day, month, year] = match;
        return `20${year}-${month}-${day}`;
    }
    return dateStr;
};

const verifyDates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Fetch raw logs again via Mongoose (now with updated schema it should distinguish 'date' vs 'Date')
        // Actually Mongoose might map 'Date' if schema has it.
        const logs = await WorkLog.find({ employeeId: { $exists: false } }).limit(5);

        const output = [];
        output.push("--- DATE NORMALIZATION TEST ---");

        logs.forEach(log => {
            const rawDate = log.date || log.get("Date"); // Access via schema or get if not in interface
            const normalized = normalizeDate(rawDate);
            output.push(`ID: ${log._id}, Raw: '${rawDate}', Normalized: '${normalized}'`);
        });

        fs.writeFileSync('verify_dates_output.txt', output.join('\n'));
        console.log("Output written to verify_dates_output.txt");

        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

verifyDates();
