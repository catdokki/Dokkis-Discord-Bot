import { Client, TextChannel } from "discord.js";
import { BattleManager } from "../battle/battleManager";
import { scoreRound } from "../battle/scoring";

export function startRoundTicker(client: Client, battles: BattleManager) {
    setInterval(async () => {
        const ended = battles.popEndedRounds(Date.now());
        for (const round of ended) {
            const channel = await client.channels.fetch(round.channelId).catch(() => null);
            if (!channel || !(channel instanceof TextChannel)) continue;

            const participantMentions = [...round.participants].map(id => `<@${id}>`).join(", ");

            const winnerStreak = battles.recordWinner(round.channelId, round.lastGifUserId);
            const scored = scoreRound(round, { winnerStreak });

            // Update in-memory totals (until DB is added).
            const totals = new Map<string, number>();
            for (const [userId, s] of scored.perUser.entries()) totals.set(userId, s.total);
            battles.applyRoundPoints(totals);

            const leaderboard = [...scored.perUser.entries()]
                .sort((a, b) => b[1].total - a[1].total)
                .slice(0, 6)
                .map(([userId, s]) => {
                    const parts: string[] = [];
                    if (s.win) parts.push(`win +${s.win}`);
                    if (s.participation) parts.push(`join +${s.participation}`);
                    if (s.crowdFavorite) parts.push(`react +${s.crowdFavorite}`);
                    if (s.streakBonus) parts.push(`streak +${s.streakBonus}`);
                    return `• <@${userId}>: **+${s.total}** (${parts.join(", ")})`;
                })
                .join("\n");

            await channel.send(
                `🏁 **GIF Battle Round Ended!**\n` +
                `👑 Winner: <@${round.lastGifUserId}>\n` +
                (winnerStreak >= 2 ? `🔥 Streak: **${winnerStreak}** (streak bonus applied)\n` : "") +
                `🎟️ Joined: ${participantMentions || "(none?)"}`
                + (leaderboard ? `\n\n**Round Points**\n${leaderboard}` : "")
            );
        }
    }, 60_000);
}
