import { handleReaction } from '../lib/reactions.js';

export default {
    name: 'hug',
    aliases: ['warmhug'],
    category: 'fun',
    description: 'Send an animated hug GIF.',
    execute: async (sock, msg, args, context) => {
        await handleReaction(sock, msg, args, context, 'hug');
    }
};
