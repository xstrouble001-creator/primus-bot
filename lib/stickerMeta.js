import webpmux from 'node-webpmux';
import crypto from 'crypto';

function buildExif(packname, author) {
    const json = {
        'sticker-pack-id': crypto.randomBytes(16).toString('hex'),
        'sticker-pack-name': packname,
        'sticker-pack-publisher': author,
        'emojis': ['🤖']
    };
    const exifAttr = Buffer.from([
        0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00,
        0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    ]);
    const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf-8');
    const exif = Buffer.concat([exifAttr, jsonBuffer]);
    exif.writeUIntLE(jsonBuffer.length, 14, 4);
    return exif;
}

export async function relabelSticker(buffer, packname, author) {
    const img = new webpmux.Image();
    await img.load(buffer);
    img.exif = buildExif(packname, author);
    return await img.save(null);
}
