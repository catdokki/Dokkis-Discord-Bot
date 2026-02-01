import { ChatInputCommandInteraction } from "discord.js";
import { BattleManager } from "../../battle/battleManager";

export async function handleLeaderboard(interaction: ChatInputCommandInteraction, battles: BattleManager) {
    const limit = interaction.options.getInteger("limit") ?? 10;
    const top = battles.getLeaderboard(limit);

    if (top.length === 0) {
        await interaction.reply({ content: "No points yet. Finish a round to start earning Chaos Points!", ephemeral: true });
        return;
    }

    const lines = top.map(([userId, points], idx) => `${idx + 1}. <@${userId}> — **${points}**`);

    await interaction.reply(
        `🏆 **Chaos Points Leaderboard**\n` +
        lines.join("\n")
    );
}
