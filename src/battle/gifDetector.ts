import { Message } from "discord.js";

const GIF_EXT = /\.(gif)(\?.*)?$/i;

export function messageHasGif(msg: Message): boolean {
    // Attachments
    if (msg.attachments.some(a => a.contentType?.includes("gif") || GIF_EXT.test(a.url))) return true;

    // Direct .gif links in content
    if (GIF_EXT.test(msg.content)) return true;

    // Embeds (tenor/giphy often show here)
    if (
        msg.embeds.some(
            e =>
                (e.url && GIF_EXT.test(e.url)) ||
                (e.thumbnail?.url && GIF_EXT.test(e.thumbnail.url)) ||
                (e.image?.url && GIF_EXT.test(e.image.url))
        )
    ) {
        return true;
    }

    return false;
}