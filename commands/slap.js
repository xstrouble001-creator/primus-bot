import { handleReaction } from '../lib/reactions.js';

export default {
    name: 'slap',
    aliases: ['smack'],
    category: 'fun',
    description: 'Send an animated slap GIF.',
    execute: async (sock, msg, args, context) => {
        await handleReaction(sock, msg, args, context, 'slap');
    }
};
