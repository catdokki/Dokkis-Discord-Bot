import { ChatInputCommandInteraction } from "discord.js";
import { BattleManager } from "../../battle/battleManager";
import { config, isBattleChannel } from "../../config";

export async function handleStatus(interaction: ChatInputCommandInteraction, battles: BattleManager) {
    if (!interaction.channelId) {
        await interaction.reply({ content: "This command can only be used in a channel.", ephemeral: true });
        return;
    }

    if (!isBattleChannel(interaction.channelId) && config.battleChannelIds.size > 0) {
        const chans = [...config.battleChannelIds].map(id => `<#${id}>`).join(", ");
        await interaction.reply({
            content: `GIF Battles are only enabled in: ${chans}`,
            ephemeral: true,
        });
        return;
    }

    const round = battles.getRound(interaction.channelId);
    if (!round) {
        await interaction.reply({ content: "No active GIF Battle round in this channel right now.", ephemeral: true });
        return;
    }

    const now = Date.now();
    const msSinceLast = now - round.lastGifAt;
    const msRemaining = Math.max(0, config.inactivityMs - msSinceLast);

    const minutes = Math.ceil(msRemaining / 60_000);
    const participants = round.participants.size;
    const lastGifBy = round.lastGifUserId ? `<@${round.lastGifUserId}>` : "(unknown)";

    await interaction.reply(
        `🎬 **GIF Battle Status**\n` +
        `• Last GIF by: ${lastGifBy}\n` +
        `• Participants: **${participants}**\n` +
        `• Round ends if quiet for: **${minutes} min**\n` +
        `• GIFs in round: **${round.gifs.length}**`
    );
}
