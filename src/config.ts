import 'dotenv/config';

export const config ={
    token: process.env.DISCORD_TOKEN,
    guildId: process.env.DISCORD_GUILD,
    inactivityMs: Number(process.env.INACTIVITY_HOURS ?? 4) * 60 * 60 * 1000,

}

if (!config.token) throw new Error('Token not found');
if (!config.guildId) throw new Error('Guild ID not found');
if (!config.inactivityMs) throw new Error('Inactive time not found');
