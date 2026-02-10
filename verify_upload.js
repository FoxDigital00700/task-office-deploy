import { Blob } from 'buffer';

const run = async () => {
    try {
        const fileContent = "Hello World Content";
        const file = new Blob([fileContent], { type: 'text/plain' });

        const formData = new FormData();
        formData.append('projectName', 'Test Project Automated');
        formData.append('taskTitle', 'Test Task Upload');
        formData.append('description', 'Test Description');
        formData.append('priority', 'Medium');
        formData.append('documents', file, 'test_doc.txt');

        console.log("Sending request to http://localhost:5000/api/tasks...");

        const res = await fetch('http://localhost:5000/api/tasks', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        console.log("Response Status:", res.status);
        console.log("Response Body:", JSON.stringify(data, null, 2));

    } catch (e) {
        console.error("Error:", e);
    }
};

run();
