import { handleReaction } from '../lib/reactions.js';

export default {
    name: 'bite',
    category: 'fun',
    description: 'Send an animated bite GIF.',
    execute: async (sock, msg, args, context) => {
        await handleReaction(sock, msg, args, context, 'bite');
    }
};
