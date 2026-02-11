import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ChannelSchema = new mongoose.Schema({}, { strict: false });
const Channel = mongoose.model('Channel', ChannelSchema);

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema);

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const channels = await Channel.find({});
        const users = await User.find({}, 'name email role designation');

        const output = {
            channelCount: channels.length,
            userCount: users.length,
            channels,
            users
        };

        fs.writeFileSync('db_dump_debug.json', JSON.stringify(output, null, 2));
        console.log('Dumped to db_dump_debug.json');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkData();
