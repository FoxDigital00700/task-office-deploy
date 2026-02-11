import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ChannelSchema = new mongoose.Schema({}, { strict: false });
const Channel = mongoose.model('Channel', ChannelSchema);

async function fixOrphans() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const channels = await Channel.find({});
        const channelIds = new Set(channels.map(c => c._id.toString()));
        let fixedCount = 0;

        for (const channel of channels) {
            if (channel.parent) {
                if (!channelIds.has(channel.parent.toString())) {
                    console.log(`Orphan found: ${channel.name} (ID: ${channel._id}) - Parent ${channel.parent} missing.`);
                    await Channel.updateOne({ _id: channel._id }, { $set: { parent: null } });
                    console.log(`-> Fixed: Set parent to null.`);
                    fixedCount++;
                }
            }
        }

        console.log(`Fixed ${fixedCount} orphaned channels.`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

fixOrphans();
