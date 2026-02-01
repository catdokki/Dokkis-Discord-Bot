import { Interaction } from "discord.js";
import { BattleManager } from "../../battle/battleManager";
import { handleLeaderboard } from "../../commands/handlers/leaderboard";
import { handlePoints } from "../../commands/handlers/points";
import { handleStatus } from "../../commands/handlers/status";

export function makeInteractionCreateHandler(battles: BattleManager) {
    return async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) return;

        try {
            switch (interaction.commandName) {
                case "status":
                    await handleStatus(interaction, battles);
                    return;
                case "leaderboard":
                    await handleLeaderboard(interaction, battles);
                    return;
                case "points":
                    await handlePoints(interaction, battles);
                    return;
                default:
                    await interaction.reply({ content: "Unknown command.", ephemeral: true });
                    return;
            }
        } catch (err) {
            console.error("interaction handler error:", err);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: "Something went wrong handling that command.", ephemeral: true }).catch(() => null);
            } else {
                await interaction.reply({ content: "Something went wrong handling that command.", ephemeral: true }).catch(() => null);
            }
        }
    };
}
