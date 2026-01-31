export type RoundState = {
    roundId: string;
    channelId: string;
    startedAt: number;
    lastGifAt: number;
    lastGifUserId: string;
    participants: Set<string>;
    gifMessageIds: string[];
};
