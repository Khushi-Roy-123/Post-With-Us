const fs = require('fs');
// Assumes node-fetch is available or using internal fetch if node 18+

async function testImageGen() {
    console.log('Testing Image Gen...');
    try {
        const response = await fetch('http://127.0.0.1:3001/api/generate-image-from-prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_prompt: 'A futuristic city with flying cars at sunset, cyberpunk style'
            })
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Body:', JSON.stringify(data, null, 2));
        fs.writeFileSync('test_output.log', JSON.stringify(data, null, 2));

        if (!response.ok) {
            console.error('Failed!');
        } else {
            console.log('Success!');
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

testImageGen();
