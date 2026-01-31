import { Client, TextChannel } from "discord.js";
import { BattleManager } from "../battle/battleManager";

export function startRoundTicker(client: Client, battles: BattleManager) {
    setInterval(async () => {
        const ended = battles.popEndedRounds(Date.now());
        for (const round of ended) {
            const channel = await client.channels.fetch(round.channelId).catch(() => null);
            if (!channel || !(channel instanceof TextChannel)) continue;

            const participantMentions = [...round.participants].map(id => `<@${id}>`).join(", ");

            await channel.send(
                `🏁 **GIF Battle Round Ended!**\n` +
                `👑 Winner: <@${round.lastGifUserId}>\n` +
                `🎟️ Joined: ${participantMentions || "(none?)"}`
            );
        }
    }, 60_000);
}
