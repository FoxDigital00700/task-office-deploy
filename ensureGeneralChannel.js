import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Channel from './src/models/Channel.js';

dotenv.config();

const ensureGeneralChannel = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const generalChannel = await Channel.findOne({ name: 'General' });
        if (!generalChannel) {
            console.log("General channel not found. Creating...");
            const newChannel = new Channel({
                name: 'General',
                type: 'Global',
                description: 'General discussion for all users',
                allowedUsers: [] // Empty means everyone for Global
            });
            await newChannel.save();
            console.log("General Channel Created!");
        } else {
            console.log("General Channel already exists.");
        }
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

ensureGeneralChannel();
