import { makeClient } from "./discord/client";
import { config } from "./config";
import { BattleManager } from "./battle/battleManager";
import { makeMessageCreateHandler } from "./discord/events/messageCreate";
import { readyHandler } from "./discord/events/ready";
import { startRoundTicker } from "./jobs/roundTicker";

async function main() {
    const client = makeClient();
    const battles = new BattleManager();

    client.once("ready", readyHandler(client));
    client.on("messageCreate", makeMessageCreateHandler(battles));

    startRoundTicker(client, battles);

    await client.login(config.token);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
