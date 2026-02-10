import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    // Optional: keep track of members directly here if needed
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default mongoose.model('Team', teamSchema);
