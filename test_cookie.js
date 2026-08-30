import ytdl from '@distube/ytdl-core';
import fs from 'fs';
import path from 'path';

const runTest = async () => {
    try {
        console.log('⚡ [TEST] Loading cookies.json...');
        const cookiePath = path.resolve('./cookies.json');
        const cookies = JSON.parse(fs.readFileSync(cookiePath, 'utf8'));
        const agent = ytdl.createAgent(cookies);

        console.log('⚡ [TEST] Fetching active track info with agent...');
        const testUrl = 'https://www.youtube.com/watch?v=kJQP7kiw5Fk'; // Despacito / Standard track
        const info = await ytdl.getInfo(testUrl, { agent });

        console.log('✅ [SUCCESS] Cookie authentication and stream check passed!');
        console.log('🎵 Video Title:', info.videoDetails.title);
    } catch (err) {
        console.error('❌ [TEST FAILED]:', err.message);
    }
};

runTest();
