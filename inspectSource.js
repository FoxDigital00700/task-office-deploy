import mongoose from "mongoose";

const sourceURI = "mongodb://admin:x_bp)3VH%5B6J9q$E@103.235.106.157:27017/chat_app?authSource=admin";

const inspect = async () => {
    try {
        const conn = await mongoose.createConnection(sourceURI).asPromise();
        console.log("Connected to Source DB");

        // Try to find the users collection. It's usually 'users'.
        const collections = await conn.db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));

        if (collections.find(c => c.name === 'users')) {
            const User = conn.model('User', new mongoose.Schema({}, { strict: false }));
            const user = await User.findOne({});
            console.log("Sample User:", JSON.stringify(user, null, 2));
        } else {
            console.log("Users collection not found!");
        }

        await conn.close();
    } catch (err) {
        console.error("Error:", err);
    }
};

inspect();
