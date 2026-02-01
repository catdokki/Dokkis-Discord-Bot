import { RoundState } from "./types";

export type UserScoreBreakdown = {
    participation: number;
    win: number;
    crowdFavorite: number;
    streakBonus: number;
    total: number;
};

export type RoundScore = {
    winnerUserId: string;
    perUser: Map<string, UserScoreBreakdown>;
    reactionsByUser: Map<string, number>;
};

const POINTS = {
    winner: 10,
    participation: 2,
    reactionPer: 1,
    reactionMax: 5,
    streakBonus: 5,
};

function ensure(perUser: Map<string, UserScoreBreakdown>, userId: string) {
    const existing = perUser.get(userId);
    if (existing) return existing;
    const fresh: UserScoreBreakdown = { participation: 0, win: 0, crowdFavorite: 0, streakBonus: 0, total: 0 };
    perUser.set(userId, fresh);
    return fresh;
}

export function scoreRound(round: RoundState, opts?: { winnerStreak?: number }) {
    const perUser = new Map<string, UserScoreBreakdown>();

    // Participation points
    for (const userId of round.participants) {
        ensure(perUser, userId).participation += POINTS.participation;
    }

    // Winner points
    ensure(perUser, round.lastGifUserId).win += POINTS.winner;

    // Crowd favorite: count unique reactors per GIF message, summed per author, capped per author
    const reactionsByUser = new Map<string, number>();
    for (const [messageId, reactors] of round.reactorsByMessageId.entries()) {
        const gif = round.gifsByMessageId.get(messageId);
        if (!gif) continue;
        const prev = reactionsByUser.get(gif.userId) ?? 0;
        reactionsByUser.set(gif.userId, prev + reactors.size);
    }
    for (const [userId, rawCount] of reactionsByUser.entries()) {
        const bonus = Math.min(POINTS.reactionMax, rawCount) * POINTS.reactionPer;
        ensure(perUser, userId).crowdFavorite += bonus;
    }

    // Streak bonus (only applies to winner). If winnerStreak >= 2, award.
    if ((opts?.winnerStreak ?? 1) >= 2) {
        ensure(perUser, round.lastGifUserId).streakBonus += POINTS.streakBonus;
    }

    // Totals
    for (const [userId, s] of perUser.entries()) {
        s.total = s.participation + s.win + s.crowdFavorite + s.streakBonus;
        perUser.set(userId, s);
    }

    const result: RoundScore = {
        winnerUserId: round.lastGifUserId,
        perUser,
        reactionsByUser,
    };
    return result;
}
