import { Message } from "discord.js";
import { messageHasGif } from "../../battle/gifDetector";
import { BattleManager } from "../../battle/battleManager";

export function makeMessageCreateHandler(battles: BattleManager) {
    return async (msg: Message) => {
        if (!msg.guild || msg.author.bot) return;

        if (!messageHasGif(msg)) return;

        const { startedNew } = battles.onGif(msg.channelId, msg.author.id, msg.id);

        if (startedNew) {
            await msg.reply(
                `🔥 **GIF Battle started!**\nPost your best GIFs — if the channel naps, the last GIF wins.`
            );
        }
    };
}
