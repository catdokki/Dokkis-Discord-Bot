export type GifEntry = {
    messageId: string;
    userId: string;
    at: number;
};

export type RoundState = {
    roundId: string;
    channelId: string;
    startedAt: number;
    lastGifAt: number;
    lastGifUserId: string;
    participants: Set<string>;

    /** All GIF posts for this round, in order */
    gifs: GifEntry[];
    /** Fast lookup: messageId -> gif entry */
    gifsByMessageId: Map<string, GifEntry>;

    /** messageId -> set of userIds who reacted (unique reactors, self-reactions excluded) */
    reactorsByMessageId: Map<string, Set<string>>;
};
