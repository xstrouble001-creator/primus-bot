import { createClient } from '@supabase/supabase-js';
import { initAuthCreds, BufferJSON } from '@whiskeysockets/baileys';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Serialize a value (which may contain Buffers) to a JSON-safe object for jsonb storage
const serialize = (value) => JSON.parse(JSON.stringify(value, BufferJSON.replacer));

// Deserialize a jsonb value back into its original shape (restoring Buffers)
const deserialize = (value) => JSON.parse(JSON.stringify(value), BufferJSON.reviver);

/**
 * Drop-in replacement for Baileys' useMultiFileAuthState, backed by Supabase.
 * Usage: const { state, saveCreds } = await useSupabaseAuthState(sessionName);
 */
export async function useSupabaseAuthState(sessionName) {
    // --- Load or initialize creds ---
    const { data: credsRow, error: credsErr } = await supabase
        .from('bot_sessions')
        .select('value')
        .eq('session_name', sessionName)
        .eq('key_type', 'creds')
        .eq('key_id', 'main')
        .maybeSingle();

    if (credsErr) {
        console.error(`❌ [supabaseAuthState] Failed to load creds for ${sessionName}:`, credsErr.message);
    }

    let creds = credsRow?.value ? deserialize(credsRow.value) : initAuthCreds();

    const saveCreds = async () => {
        const { error } = await supabase
            .from('bot_sessions')
            .upsert({
                session_name: sessionName,
                key_type: 'creds',
                key_id: 'main',
                value: serialize(creds),
                updated_at: new Date().toISOString()
            }, { onConflict: 'session_name,key_type,key_id' });

        if (error) {
            console.error(`❌ [supabaseAuthState] Failed to save creds for ${sessionName}:`, error.message);
        }
    };

    // --- Signal key store (pre-keys, sessions, sender-keys, app-state keys, etc.) ---
    const keys = {
        get: async (type, ids) => {
            const result = {};
            if (!ids.length) return result;

            const { data, error } = await supabase
                .from('bot_sessions')
                .select('key_id, value')
                .eq('session_name', sessionName)
                .eq('key_type', type)
                .in('key_id', ids);

            if (error) {
                console.error(`❌ [supabaseAuthState] Failed to get keys (${type}) for ${sessionName}:`, error.message);
                return result;
            }

            for (const row of data || []) {
                result[row.key_id] = deserialize(row.value);
            }
            return result;
        },

        set: async (data) => {
            const rows = [];
            const deletions = [];

            for (const type in data) {
                for (const id in data[type]) {
                    const value = data[type][id];
                    if (value === null || value === undefined) {
                        deletions.push({ type, id });
                    } else {
                        rows.push({
                            session_name: sessionName,
                            key_type: type,
                            key_id: id,
                            value: serialize(value),
                            updated_at: new Date().toISOString()
                        });
                    }
                }
            }

            if (rows.length) {
                const { error } = await supabase
                    .from('bot_sessions')
                    .upsert(rows, { onConflict: 'session_name,key_type,key_id' });
                if (error) {
                    console.error(`❌ [supabaseAuthState] Failed to set keys for ${sessionName}:`, error.message);
                }
            }

            for (const { type, id } of deletions) {
                const { error } = await supabase
                    .from('bot_sessions')
                    .delete()
                    .eq('session_name', sessionName)
                    .eq('key_type', type)
                    .eq('key_id', id);
                if (error) {
                    console.error(`❌ [supabaseAuthState] Failed to delete key (${type}/${id}) for ${sessionName}:`, error.message);
                }
            }
        }
    };

    return { state: { creds, keys }, saveCreds };
}

/**
 * Wipes all stored session data (creds + keys) for a session — the Supabase
 * equivalent of fs.rmSync(sessionFolder) when a session is logged out.
 */
export async function clearSupabaseAuthState(sessionName) {
    const { error } = await supabase
        .from('bot_sessions')
        .delete()
        .eq('session_name', sessionName);

    if (error) {
        console.error(`❌ [supabaseAuthState] Failed to clear session ${sessionName}:`, error.message);
    }
}
