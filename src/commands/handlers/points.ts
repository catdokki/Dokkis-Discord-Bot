import { ChatInputCommandInteraction } from "discord.js";
import { BattleManager } from "../../battle/battleManager";

export async function handlePoints(interaction: ChatInputCommandInteraction, battles: BattleManager) {
    const target = interaction.options.getUser("user") ?? interaction.user;
    const points = battles.getUserPoints(target.id);

    const prefix = target.id === interaction.user.id ? "You have" : `${target.username} has`;

    await interaction.reply({
        content: `${prefix} **${points}** Chaos Points.`,
        allowedMentions: { users: [target.id] },
    });
}
