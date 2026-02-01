import { randomUUID } from "crypto";
import { config } from "../config";
import { GifEntry, RoundState } from "./types";

export class BattleManager {
    private roundsByChannel = new Map<string, RoundState>();

    /** In-memory chaos points totals (per-guild persistence comes later with DB). */
    private pointsByUser = new Map<string, number>();

    /** Per-channel win streak tracking (in-memory until DB is added). */
    private lastWinnerByChannel = new Map<string, { userId: string; streak: number }>();

    getRound(channelId: string) {
        return this.roundsByChannel.get(channelId);
    }

    getLastWinner(channelId: string) {
        return this.lastWinnerByChannel.get(channelId);
    }

    getUserPoints(userId: string) {
        return this.pointsByUser.get(userId) ?? 0;
    }

    /** Add points to a user (can be negative). */
    addPoints(userId: string, delta: number) {
        if (!delta) return this.getUserPoints(userId);
        const next = this.getUserPoints(userId) + delta;
        this.pointsByUser.set(userId, next);
        return next;
    }

    /** Apply a batch of scored points (e.g., at end of round). */
    applyRoundPoints(perUserTotal: Map<string, number>) {
        for (const [userId, total] of perUserTotal.entries()) {
            this.addPoints(userId, total);
        }
    }

    /** Top users by total points (in-memory). */
    getLeaderboard(limit = 10) {
        return [...this.pointsByUser.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);
    }

    onGif(channelId: string, userId: string, messageId: string, now = Date.now()) {
        const existing = this.roundsByChannel.get(channelId);

        const gif: GifEntry = { messageId, userId, at: now };

        // start new if none or stale
        if (!existing || now - existing.lastGifAt >= config.inactivityMs) {
            const round: RoundState = {
                roundId: randomUUID(),
                channelId,
                startedAt: now,
                lastGifAt: now,
                lastGifUserId: userId,
                participants: new Set([userId]),
                gifs: [gif],
                gifsByMessageId: new Map([[messageId, gif]]),
                reactorsByMessageId: new Map(),
            };
            this.roundsByChannel.set(channelId, round);
            return { round, startedNew: true };
        }

        existing.lastGifAt = now;
        existing.lastGifUserId = userId;
        existing.participants.add(userId);
        existing.gifs.push(gif);
        existing.gifsByMessageId.set(messageId, gif);
        return { round: existing, startedNew: false };
    }

    /** Track a reaction on a message *if* that message is part of the active round. */
    onReaction(channelId: string, messageId: string, reactorUserId: string) {
        const round = this.roundsByChannel.get(channelId);
        if (!round) return { tracked: false as const };

        if (!round.gifsByMessageId.has(messageId)) return { tracked: false as const };

        const existingSet = round.reactorsByMessageId.get(messageId) ?? new Set<string>();
        const beforeSize = existingSet.size;
        existingSet.add(reactorUserId);
        round.reactorsByMessageId.set(messageId, existingSet);

        return { tracked: existingSet.size !== beforeSize };
    }

    /** Un-track a reaction on a message (used by messageReactionRemove). */
    onReactionRemove(channelId: string, messageId: string, reactorUserId: string) {
        const round = this.roundsByChannel.get(channelId);
        if (!round) return { tracked: false as const };

        if (!round.gifsByMessageId.has(messageId)) return { tracked: false as const };

        const existingSet = round.reactorsByMessageId.get(messageId);
        if (!existingSet) return { tracked: false as const };

        const didDelete = existingSet.delete(reactorUserId);
        if (existingSet.size === 0) round.reactorsByMessageId.delete(messageId);

        return { tracked: didDelete };
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

    /** Update streak tracking after a round ends. Returns the updated streak for the winner. */
    recordWinner(channelId: string, winnerUserId: string) {
        const prev = this.lastWinnerByChannel.get(channelId);
        const nextStreak = prev?.userId === winnerUserId ? prev.streak + 1 : 1;
        this.lastWinnerByChannel.set(channelId, { userId: winnerUserId, streak: nextStreak });
        return nextStreak;
    }
}
