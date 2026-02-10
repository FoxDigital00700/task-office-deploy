
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api/options';

async function testOptions() {
    try {
        console.log("--- Testing GET /all ---");
        let res = await fetch(`${API_URL}/all`);
        let data = await res.json();
        console.log("Status:", res.status);
        if (res.ok) {
            console.log("Departments count:", data.department ? data.department.length : 0);
            console.log("Roles count:", data.designation ? data.designation.length : 0);
            console.log("WorkTypes count:", data.workType ? data.workType.length : 0);
        } else {
            console.log("FAILED GET:", data.message);
        }

        console.log("\n--- Testing POST /add (New Department) ---");
        const newDept = { category: "department", value: `New Dept ${Math.floor(Math.random() * 1000)}` };
        res = await fetch(`${API_URL}/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newDept)
        });
        data = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", data);

        if (res.status === 201) {
            console.log("\n--- Verifying Addition ---");
            res = await fetch(`${API_URL}/all`);
            data = await res.json();
            const found = data.department.find(d => d.value === newDept.value);
            console.log("Found newly added dept:", found ? "YES" : "NO");
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

testOptions();
