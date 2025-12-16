async function testQuickPost() {
    console.log('Testing Quick Post...');
    try {
        const response = await fetch('http://localhost:3001/api/quick-post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: 'Test post for coffee launch',
                platform: 'Twitter',
                media: []
            })
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Body:', text);

        if (!response.ok) {
            console.error('Failed!');
        } else {
            console.log('Success!');
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

testQuickPost();
