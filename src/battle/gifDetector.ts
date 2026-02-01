import { Message } from "discord.js";

/**
 * Discord GIFs come in a few common shapes:
 * - Real .gif URLs (attachments, CDN links)
 * - Tenor share URLs (tenor.com/view/...) that *do not* end in .gif
 * - Giphy share URLs (giphy.com/gifs/...) that *do not* end in .gif
 * - CDN render URLs that may end in .webp/.png but are still "GIF posts" from Discord's picker
 */

const GIF_EXT_ANYWHERE = /\.gif(\?.*)?$/i;
const TENOR = /(^|\.)tenor\.com\//i;
const GIPHY = /(^|\.)giphy\.com\//i;

function isGifLikeUrl(url?: string | null): boolean {
    if (!url) return false;
    return GIF_EXT_ANYWHERE.test(url) || TENOR.test(url) || GIPHY.test(url);
}

export function messageHasGif(msg: Message): boolean {
    // 1) Attachments (best signal)
    if (
        msg.attachments.some(a =>
            Boolean(a.contentType?.toLowerCase().includes("gif")) || isGifLikeUrl(a.url)
        )
    ) {
        return true;
    }

    // 2) Content links (Tenor/Giphy share links often live here)
    if (isGifLikeUrl(msg.content)) return true;

    // 3) Embeds (Discord often puts Tenor/Giphy details here)
    if (
        msg.embeds.some(e =>
            isGifLikeUrl(e.url) ||
            isGifLikeUrl(e.thumbnail?.url) ||
            isGifLikeUrl(e.image?.url) ||
            // Provider hints (some embeds don't give URLs ending in .gif)
            (e.provider?.name ? /(tenor|giphy)/i.test(e.provider.name) : false)
        )
    ) {
        return true;
    }

    return false;
}