
import fetch from "node-fetch";

const API_URL = "http://localhost:5000/api/work-logs";

const testApi = async () => {
    try {
        console.log(`Fetching from ${API_URL}...`);
        const res = await fetch(API_URL);
        console.log(`Status: ${res.status} ${res.statusText}`);

        if (res.ok) {
            const data = await res.json();
            console.log(`Success! Received ${data.length} logs.`);
            if (data.length > 0) {
                console.log("Sample log ID:", data[0]._id);
            }
        } else {
            console.log("Failed to fetch logs.");
            const text = await res.text();
            console.log("Response:", text);
        }
    } catch (error) {
        console.error("Error testing API:", error.message);
    }
};

testApi();
