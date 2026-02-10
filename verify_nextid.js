
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api/employee/nextid';

async function testNextId() {
    try {
        console.log("Sending request to", API_URL);
        const response = await fetch(API_URL);

        if (response.ok) {
            const data = await response.json();
            console.log("SUCCESS: Next ID fetched.");
            console.log("Next ID:", data.nextId);

            if (data.nextId && data.nextId.startsWith("FOXIAN")) {
                console.log("VERIFIED: ID format is correct (FOXIAN...).");
            } else {
                console.log("WARNING: Unexpected ID format (Expected FOXIAN...):", data.nextId);
            }
        } else {
            console.log("FAILED to fetch next ID:", response.status, response.statusText);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

testNextId();
