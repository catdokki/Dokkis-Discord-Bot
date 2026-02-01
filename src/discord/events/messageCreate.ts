import { Message } from "discord.js";
import { messageHasGif } from "../../battle/gifDetector";
import { BattleManager } from "../../battle/battleManager";
import { isBattleChannel } from "../../config";

export function makeMessageCreateHandler(battles: BattleManager) {
    return async (msg: Message) => {
        if (!msg.guild || msg.author.bot) return;

        // Restrict GIF battles to configured battle channels (if any).
        if (!isBattleChannel(msg.channelId)) return;

        if (!messageHasGif(msg)) return;

        const { startedNew } = battles.onGif(msg.channelId, msg.author.id, msg.id);

        if (startedNew) {
            await msg.reply(
                `🔥 **GIF Battle started!**\nPost your best GIFs — if the channel naps, the last GIF wins.`
            );
        }
    };
}
