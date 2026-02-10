
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import WorkLog from './src/models/WorkLog.js';
import User from './src/models/User.js';

dotenv.config();

const verifyFix = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB via verification script");

        // 1. Find a user name that appears in taskOwner
        // We know from previous debug that 'Jaya' might be one, or we can find one dynamically.
        const logWithOwner = await WorkLog.findOne({
            "Task Owner": { $exists: true, $ne: "" },
            employeeId: { $exists: false } // ensure it's an imported one
        });

        if (!logWithOwner) {
            console.log("No imported logs with 'Task Owner' found to test.");
            process.exit();
        }

        const ownerName = logWithOwner["Task Owner"];
        console.log(`Testing with Task Owner: "${ownerName}"`);

        // 2. Find a User with this name
        // Note: The name in CSV might differ slightly (trimming etc), but let's try exact match first.
        // If exact match fails, we might need to adjust logic, but for now we test exact.
        const user = await User.findOne({ name: ownerName });

        if (!user) {
            console.log(`User with name "${ownerName}" not found in Users collection. Can't verify mapping.`);
            // List some users to see if there's a mismatch
            const users = await User.find().limit(5);
            console.log("Available users:", users.map(u => u.name));
            process.exit();
        }

        console.log(`Found User: ${user.name} (ID: ${user._id})`);

        // 3. Simulate the query logic: Find logs where employeeId matches OR taskOwner matches
        const logs = await WorkLog.find({
            $or: [
                { employeeId: user._id },
                { taskOwner: user.name },
                { "Task Owner": user.name }
            ]
        });

        const output = [];
        output.push(`Found ${logs.length} logs for user ${user.name}.`);

        const importedLogs = logs.filter(l => !l.employeeId);
        output.push(`Of which ${importedLogs.length} are imported (missing employeeId).`);

        if (importedLogs.length > 0) {
            output.push("SUCCESS: Imported logs are being fetched!");
            output.push("Sample imported log taskOwner: " + (importedLogs[0].taskOwner || importedLogs[0]["Task Owner"]));

            // Verify normalization simulation
            const logObj = importedLogs[0].toObject();
            const normalized = {
                taskOwner: logObj.taskOwner || logObj["Task Owner"],
                projectName: logObj.projectName || logObj["Project Name"]
            };
            output.push("Normalized sample: " + JSON.stringify(normalized));

        } else {
            output.push("FAILURE: Imported logs were NOT fetched.");
            // Dump one imported log to see why
            const anyImported = await WorkLog.findOne({ "Task Owner": { $exists: true } });
            if (anyImported) {
                output.push("But an imported log EXISTS: " + anyImported["Task Owner"]);
                output.push("Maybe user name mismatch? User: '" + user.name + "' vs Log: '" + anyImported["Task Owner"] + "'");
            } else {
                output.push("And no imported logs with 'Task Owner' found via Mongoose even with schema update.");
            }
        }

        fs.writeFileSync('verify_output.txt', output.join('\n'));
        console.log("Output written to verify_output.txt");

        process.exit();

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

verifyFix();
