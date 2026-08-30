import readline from 'readline';
import { startSession } from './lib/sessionManager.js';
import { commands, aliases, loadCommands } from './index.js';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

const main = async () => {
    await loadCommands();

    console.log('\n⚡ 𝙿 𝚁 𝙸 𝙼 𝚄 𝚂   𝙼 𝙳  •  𝙿 𝙰 𝙸 𝚁 𝙸 𝙽 𝙶  𝚃 𝙾 𝙾 𝙻 ⚡');
    console.log('❖──────────────────────────────────────❖');
    console.log('│  Enter the number to pair (with country code)');
    console.log('│  Example: 2348012345678');
    console.log('❖──────────────────────────────────────❖\n');

    const raw = await ask('📱 Number: ');
    const number = raw.replace(/[^0-9]/g, '');

    if (!number || number.length < 7) {
        console.log('❌ Invalid number. Exiting.');
        rl.close();
        process.exit(1);
    }

    const sessionName = `user_${number}`;
    console.log(`\n⚡ Starting session for ${number}...`);
    console.log('⏳ Requesting pairing code in 4 seconds...\n');

    await startSession(
        { name: sessionName, number },
        commands,
        aliases,
        0,
        (code, err) => {
            if (err) {
                console.log(`❌ Failed to get pairing code: ${err}`);
                rl.close();
                process.exit(1);
            }
            console.log('\n❖──────────────────────────────────────❖');
            console.log(`│  🔑 PAIRING CODE: ${code}`);
            console.log('❖──────────────────────────────────────❖');
            console.log('\n📲 Open WhatsApp > Linked Devices > Link with phone number');
            console.log('   Type the code above immediately.\n');
            console.log('⏳ Waiting for you to link... (Ctrl+C once done)\n');
            rl.close();
        }
    );
};

main().catch((err) => {
    console.error('❌ pair.js error:', err);
    process.exit(1);
});
