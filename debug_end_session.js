import axios from 'axios';

const testEndSession = async () => {
    const taskId = '698c2f95ab17c6633823e63d'; // ID from screenshot
    // Using port 8000 internal controller? No, Office Sync is 5000? 
    // Wait, Office Sync is running on 5000 or 5500?
    // User said "http://localhost:5500" for chat link.
    // In config it might be 5000 for API. 
    // Let's try 5000 first (default backend port for MERN usually).
    // The previous internal controller used `http://localhost:5500/chat/...` in response.
    // But the server itself listens on?
    // Let's try 5000.
    const url = 'http://localhost:5000/api/internal/end-session';

    console.log(`Testing End Session for Task ID: ${taskId}`);

    try {
        const res = await axios.post(url, { taskId });
        console.log('Response:', res.status, res.data);
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
};

testEndSession();
