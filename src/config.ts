import 'dotenv/config';

export const config ={
    token: process.env.DISCORD_TOKEN,
    guildId: process.env.DISCORD_GUILD,
    inactive: process.env.ROUND_COUNTER
}

if (!config.token) throw new Error('Token not found');
if (!config.guildId) throw new Error('Guild ID not found');
if (!config.inactive) throw new Error('Inactive time not found');
