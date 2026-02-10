
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const debugRaw = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Access existing collection directly
        const collection = mongoose.connection.db.collection('employee_logs');

        // Find one log missing employeeId
        const log = await collection.findOne({ employeeId: { $exists: false } });

        console.log("--- RAW IMPORTED LOG ---");
        console.log(JSON.stringify(log, null, 2));

        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

debugRaw();
