import { randomUUID } from "crypto";
import { config } from "../config";
import { RoundState } from "./types";

export class BattleManager {
    private roundsByChannel = new Map<string, RoundState>();

    getRound(channelId: string) {
        return this.roundsByChannel.get(channelId);
    }

    onGif(channelId: string, userId: string, messageId: string, now = Date.now()) {
        const existing = this.roundsByChannel.get(channelId);

        // start new if none or stale
        if (!existing || now - existing.lastGifAt >= config.inactivityMs) {
            const round: RoundState = {
                roundId: randomUUID(),
                channelId,
                startedAt: now,
                lastGifAt: now,
                lastGifUserId: userId,
                participants: new Set([userId]),
                gifMessageIds: [messageId],
            };
            this.roundsByChannel.set(channelId, round);
            return { round, startedNew: true };
        }

        existing.lastGifAt = now;
        existing.lastGifUserId = userId;
        existing.participants.add(userId);
        existing.gifMessageIds.push(messageId);
        return { round: existing, startedNew: false };
    }

    popEndedRounds(now = Date.now()) {
        const ended: RoundState[] = [];
        for (const [channelId, round] of this.roundsByChannel.entries()) {
            if (now - round.lastGifAt >= config.inactivityMs) {
                ended.push(round);
                this.roundsByChannel.delete(channelId);
            }
        }
        return ended;
    }
}
