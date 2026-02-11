import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from root of backend_v2
dotenv.config({ path: path.join(__dirname, '../../.env') });

const ChannelSchema = new mongoose.Schema({}, { strict: false });
const Channel = mongoose.model('Channel', ChannelSchema);

async function checkChannels() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const channels = await Channel.find({});
        console.log(`Found ${channels.length} channels.`);
        console.log(JSON.stringify(channels, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkChannels();
