import fetch from 'node-fetch';

async function check() {
    try {
        const res = await fetch('http://localhost:5000/api/work-logs');
        const data = await res.json();
        console.log("Total:", data.length);

        const hasOwner = data.filter(d => d.taskOwner).length;
        const hasType = data.filter(d => d.taskType).length;

        console.log(`Has Owner: ${hasOwner} / ${data.length}`);
        console.log(`Has Type: ${hasType} / ${data.length}`);

        if (data.length > 0) {
            // Find one that has owner
            const withOwner = data.find(d => d.taskOwner);
            console.log("Sample Owner:", withOwner ? withOwner.taskOwner : "None");
            console.log("Sample Type:", withOwner ? withOwner.taskType : "None");
        }
    } catch (err) { console.error(err); }
}
check();
