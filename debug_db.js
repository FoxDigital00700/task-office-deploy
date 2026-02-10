import mongoose from "mongoose";
import Task from "./src/models/Task.js";
import User from "./src/models/User.js";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        let output = "";
        output += "Connected to DB\n";

        const tasks = await Task.find().sort({ createdAt: -1 }).limit(5);
        output += "\n--- Recent 5 Tasks ---\n";
        tasks.forEach(t => {
            output += `\nTask: ${t.taskTitle}\n`;
            output += `  ID: ${t._id}\n`;
            output += `  AssignType: ${t.assignType}\n`;
            output += `  Assignee (Raw): ${JSON.stringify(t.assignee)}\n`;
            output += `  Status: ${t.status}\n`;
            output += `  AssignedTo (Accepted): ${JSON.stringify(t.assignedTo)}\n`;
        });

        const users = await User.find({ role: { $ne: "Super Admin" } }).limit(5);
        output += "\n--- Some Employees ---\n";
        users.forEach(u => {
            output += `User: ${u.name}, ID: ${u._id}, Role: ${u.role}\n`;
        });

        fs.writeFileSync("debug_output.txt", output);
        console.log("Written to debug_output.txt");

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

checkData();
