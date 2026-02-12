
import fetch from 'node-fetch';

async function testBackend() {
    const url = 'https://office-backend-50fc.onrender.com';
    const origin = 'https://taskmanageroffice.netlify.app';

    console.log(`Testing Backend: ${url}`);
    try {
        const res = await fetch(url + '/', {
            method: 'GET',
            headers: {
                'Origin': origin
            }
        });

        console.log(`Status: ${res.status} ${res.statusText}`);
        console.log('CORS Headers:');
        console.log('Access-Control-Allow-Origin:', res.headers.get('access-control-allow-origin'));
        console.log('Access-Control-Allow-Credentials:', res.headers.get('access-control-allow-credentials'));

        const text = await res.text();
        console.log('Body:', text);

    } catch (err) {
        console.error('Fetch Error:', err.message);
    }
}

testBackend();
