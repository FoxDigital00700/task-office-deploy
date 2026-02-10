import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:5000';

async function testBackend() {
    try {
        console.log("1. Testing Login...");
        // Use the seeded Super Admin credentials (or a known user)
        const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
            email: "admin@example.com",
            password: "password123"
        });

        if (loginRes.data.token) {
            console.log("✅ Login Successful. Token received.");
            const token = loginRes.data.token;

            console.log("2. Testing Get Channels...");
            const channelsRes = await axios.get(`${API_URL}/api/channels`, {
                headers: { 'x-auth-token': token }
            });

            console.log(`✅ Fetch Channels Successful. Found ${channelsRes.data.length} channels.`);
            channelsRes.data.forEach(c => console.log(` - ${c.name} (${c.type})`));
        } else {
            console.error("❌ Login Failed: No token returned.");
        }

    } catch (err) {
        console.error("❌ Test Failed:", err.response ? err.response.data : err.message);
    }
}

testBackend();
