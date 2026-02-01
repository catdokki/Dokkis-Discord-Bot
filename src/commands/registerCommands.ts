import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { config } from "../config";

/**
 * Slash command definitions.
 *
 * Note: we register as *guild commands* for fast iteration.
 * Global commands can take up to ~1 hour to propagate.
 */
export const commandData = [
    new SlashCommandBuilder()
        .setName("status")
        .setDescription("Show the current GIF Battle round status in this channel."),
    new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Show the Chaos Points leaderboard (in-memory for now).")
        .addIntegerOption(opt =>
            opt
                .setName("limit")
                .setDescription("How many users to show (default 10, max 25).")
                .setMinValue(1)
                .setMaxValue(25)
                .setRequired(false)
        ),
].map(c => c.toJSON());

export async function registerGuildCommands(clientId: string) {
    const rest = new REST({ version: "10" }).setToken(config.token!);

    // Register to a single guild for instant updates.
    await rest.put(Routes.applicationGuildCommands(clientId, config.guildId!), {
        body: commandData,
    });
}
