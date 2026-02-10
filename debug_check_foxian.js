
import mongoose from "mongoose";
import User from "./src/models/User.js";
import dotenv from "dotenv";



dotenv.config();

const checkSpecific = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Checking for Foxian001 directly...");
        const exact = await User.findOne({ employeeId: "Foxian001" });
        console.log("Exact Match:", exact ? "FOUND" : "NOT FOUND");

        console.log("Checking with Regex...");
        const regexMatch = await User.findOne({ employeeId: { $regex: /^Foxian\d+$/ } });
        console.log("Regex Match (any):", regexMatch ? regexMatch.employeeId : "NONE");

        const sorted = await User.find({ employeeId: { $regex: /^Foxian\d+$/ } })
            .sort({ createdAt: -1 })
            .limit(1);
        console.log("Sorted Match (last created):", sorted.length > 0 ? sorted[0].employeeId : "NONE");

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

checkSpecific();
