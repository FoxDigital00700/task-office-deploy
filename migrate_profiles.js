import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const migrateProfiles = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");

        const users = await User.find({});
        console.log(`Found ${users.length} users to check.`);

        let updatedCount = 0;
        for (const user of users) {
            let updated = false;

            // Ensure Name exists
            if (!user.name) {
                user.name = user.email.split('@')[0]; // Default name from email
                updated = true;
            }

            // Ensure Designation exists
            if (!user.designation) {
                user.designation = "Employee"; // Default designation
                updated = true;
            }

            // Ensure Role is an array
            if (!Array.isArray(user.role)) {
                user.role = [user.role || "Employee"]; // Default role
                updated = true;
            } else if (user.role.length === 0) {
                user.role = ["Employee"];
                updated = true;
            }

            // Ensure Employee ID exists (if missing, use random or _id substring)
            if (!user.employeeId) {
                user.employeeId = `EMP-${user._id.toString().substring(0, 6).toUpperCase()}`;
                updated = true;
            }

            // Ensure Work Type exists
            if (!user.workType) {
                user.workType = "Full Time";
                updated = true;
            }

            if (updated) {
                await user.save();
                console.log(`✅ Updated profile for: ${user.email} (${user.name})`);
                updatedCount++;
            }
        }

        console.log(`Migration Complete. Updated ${updatedCount} profiles.`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration Failed:", error);
        process.exit(1);
    }
};

migrateProfiles();
