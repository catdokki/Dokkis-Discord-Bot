import { Client } from "discord.js";
import { registerGuildCommands } from "../../commands/registerCommands";

export function readyHandler(client: Client) {
    return async () => {
        console.log(`✅ Logged in as ${client.user?.tag}`);

        // Register slash commands (guild-scoped for fast iteration)
        if (!client.user) return;
        try {
            await registerGuildCommands(client.user.id);
            console.log("✅ Slash commands registered");
        } catch (err) {
            console.error("❌ Failed to register slash commands:", err);
        }
    };
}
