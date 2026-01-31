import { Client } from "discord.js";

export function readyHandler(client: Client) {
    return () => console.log(`✅ Logged in as ${client.user?.tag}`);
}
