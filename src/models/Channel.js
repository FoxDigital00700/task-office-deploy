import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ['Global', 'Team', 'Private'],
        required: true
    },
    // For Team based channels
    allowedTeams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    // For Private channels
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // For Hierarchy (Branches)
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', default: null },

    description: String,

    // Status for Session Management
    status: {
        type: String,
        enum: ['Active', 'Archived'],
        default: 'Active'
    }
}, { timestamps: true });

export default mongoose.model('Channel', channelSchema);
