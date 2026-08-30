import axios from 'axios';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function gifUrlToMp4(gifUrl) {
    const tempGif = path.resolve(`./temp_gif_src_${Date.now()}.gif`);
    const tempMp4 = path.resolve(`./temp_gif_out_${Date.now()}.mp4`);

    const response = await axios.get(gifUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(tempGif, response.data);

    try {
        await execAsync(`ffmpeg -y -i "${tempGif}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "${tempMp4}"`);
    } finally {
        if (fs.existsSync(tempGif)) fs.unlinkSync(tempGif);
    }

    if (!fs.existsSync(tempMp4)) {
        throw new Error('ffmpeg conversion failed to produce output file');
    }

    return tempMp4;
}
