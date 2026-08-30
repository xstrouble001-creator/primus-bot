const runApiTest = async () => {
    try {
        console.log('⚡ [TEST] Querying reliable media stream API...');
        const targetUrl = 'https://www.youtube.com/watch?v=kJQP7kiw5Fk';
        const apiUrl = `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(targetUrl)}`;
        
        const res = await fetch(apiUrl);
        const json = await res.json();
        
        if (json && (json.status || json.data)) {
            console.log('✅ [SUCCESS] Stream link resolved successfully!');
            console.log('🔗 Audio Link:', json.data?.dl || json.data?.audio || json.data);
        } else {
            console.log('❌ [API ERROR]:', json);
        }
    } catch (err) {
        console.error('❌ [TEST FAILED]:', err.message);
    }
};

runApiTest();
