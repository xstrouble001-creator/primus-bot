import { exec } from 'child_process';
import path from 'path';

const testUrl = 'https://www.youtube.com/watch?v=kJQP7kiw5Fk';
const outputPath = path.resolve('./test_audio.mp3');

console.log('⚡ [TEST] Running yt-dlp via Termux subprocess...');

const command = `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${testUrl}"`;

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error('❌ [TEST FAILED]:', error.message);
        return;
    }
    console.log('✅ [SUCCESS] Audio downloaded locally via yt-dlp!');
    console.log(stdout);
});
