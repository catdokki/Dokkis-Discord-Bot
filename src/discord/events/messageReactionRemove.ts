import { MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";
import { BattleManager } from "../../battle/battleManager";
import { isBattleChannel } from "../../config";

export function makeMessageReactionRemoveHandler(battles: BattleManager) {
    return async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
        if (user.bot) return;

        // Partial safety
        try {
            if (reaction.partial) await reaction.fetch();
            if (reaction.message.partial) await reaction.message.fetch();
        } catch {
            // Can't fetch - ignore
            return;
        }

        const msg = reaction.message;
        if (!msg.guild) return;

        // Restrict reaction tracking to configured battle channels (if any).
        if (!isBattleChannel(msg.channelId)) return;

        // Ignore self-reactions (author reacting to own GIF)
        if (msg.author?.id && msg.author.id === user.id) return;

        // Only un-track reactions for messages that are part of the active round in this channel
        battles.onReactionRemove(msg.channelId, msg.id, user.id);
    };
}
