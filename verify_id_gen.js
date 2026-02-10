
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api/employee/add';

async function testAddEmployee() {
    const randomNum = Math.floor(Math.random() * 10000);
    const employeeData = {
        name: `Test User ${randomNum}`,
        email: `test${randomNum}@gmail.com`,
        // employeeId: "SHOULD_BE_IGNORED", 
        role: ["SM Developer"],
        designation: "Junior",
        workType: "Full Time",
        joiningDate: "2023-10-26",
        password: "password123"
    };

    try {
        console.log("Sending request to", API_URL);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employeeData)
        });

        const data = await response.json();
        console.log("Response Status:", response.status);
        console.log("Response Data:", data);

        if (response.status === 210 || response.status === 201) {
            console.log("SUCCESS: Employee added.");
            if (data.message && data.message.includes("Foxian")) {
                console.log("VERIFIED: ID generated correctly: " + data.message);
            } else if (data.user && data.user.employeeId && data.user.employeeId.startsWith("Foxian")) {
                console.log("VERIFIED: ID generated correctly: " + data.user.employeeId);
            } else {
                console.log("WARNING: ID might not be correct:", data);
            }
        } else {
            console.log("FAILED:", data.message);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

testAddEmployee();
