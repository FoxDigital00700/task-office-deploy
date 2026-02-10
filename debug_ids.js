
import mongoose from "mongoose";
import User from "./src/models/User.js";
import dotenv from "dotenv";

dotenv.config();

const listIds = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}, "employeeId name createdAt").sort({ employeeId: 1 });
        console.log("--- Existing Employee IDs ---");
        users.forEach(u => {
            console.log(`ID: ${u.employeeId}, Name: ${u.name}, Created: ${u.createdAt}`);
        });

        // Test the query I used
        const lastEmployee = await User.findOne({ employeeId: { $regex: /^Foxian\d+$/ } })
            .sort({ createdAt: -1 })
            .collation({ locale: "en_US", numericOrdering: true });

        console.log("\n--- Query Result ---");
        console.log("Last Employee Found:", lastEmployee ? lastEmployee.employeeId : "None");

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

listIds();
