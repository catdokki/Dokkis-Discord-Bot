import 'dotenv/config';

function parseIdList(value: string | undefined): Set<string> {
    if (!value) return new Set();
    return new Set(
        value
            .split(',')
            .map(v => v.trim())
            .filter(Boolean)
    );
}

export const config ={
    token: process.env.DISCORD_TOKEN,
    guildId: process.env.DISCORD_GUILD,
    inactivityMs: Number(process.env.INACTIVITY_HOURS ?? 4) * 60 * 60 * 1000,
    // Optional: restrict battles to one or more channels.
    // Comma-separated list of channel IDs (recommended).
    battleChannelIds: parseIdList(process.env.BATTLE_CHANNEL_IDS ?? process.env.BATTLE_CHANNEL_ID),

}

if (!config.token) throw new Error('Token not found');
if (!config.guildId) throw new Error('Guild ID not found');
if (!config.inactivityMs) throw new Error('Inactive time not found');

/** If no battle channels are configured, allow battles in all channels. */
export function isBattleChannel(channelId: string): boolean {
    return config.battleChannelIds.size === 0 || config.battleChannelIds.has(channelId);
}
