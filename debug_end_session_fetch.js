const testEndSession = async () => {
    const taskId = '698c2f95ab17c6633823e63d'; // ID from screenshot
    // Try both ports if needed, but start with 5000
    const url = 'http://localhost:5000/api/internal/end-session';

    console.log(`Testing End Session for Task ID: ${taskId}`);

    try {
        // Use a valid User ID (e.g. from curl command or known user)
        const userId = '67a6d6d4760a8767e7819ce4';
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId, userId })
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = await response.text();
        }

        console.log('Response Status:', response.status);
        console.log('Response Data:', data);
    } catch (error) {
        console.error('Error:', error.message);
    }
};

testEndSession();
