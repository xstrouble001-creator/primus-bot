import { handleReaction } from '../lib/reactions.js';

export default {
    name: 'pat',
    aliases: ['headpat'],
    category: 'fun',
    description: 'Send an animated headpat GIF.',
    execute: async (sock, msg, args, context) => {
        await handleReaction(sock, msg, args, context, 'pat');
    }
};
