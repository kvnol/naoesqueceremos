import type { Category } from "./types";

export type VideoProvider =
  | "youtube"
  | "vimeo"
  | "drive"
  | "twitter"
  | "instagram"
  | null;

export type MediaKind =
  | "youtube"
  | "vimeo"
  | "drive-preview"
  | "drive-image"
  | "twitter"
  | "instagram"
  | "direct-image"
  | "direct-audio"
  | "unknown";

export interface ResolvedMedia {
  kind: MediaKind;
  mediaUrl?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  playable: boolean;
  /** Rótulo amigável do provedor (para UI) */
  providerLabel?: string;
}

function extractDriveId(url: string): string | null {
  const file = url.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (file?.[1]) return file[1];
  const open = url.match(/[?&]id=([^&]+)/i);
  if (open?.[1] && /drive\.google\.com/i.test(url)) return open[1];
  return null;
}

export function extractYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i,
  );
  return match?.[1] ?? null;
}

export function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  return match?.[1] ?? null;
}

/** status ID de twitter.com ou x.com */
export function extractTweetId(url: string): string | null {
  const match = url.match(
    /(?:twitter\.com|x\.com|mobile\.twitter\.com)\/(?:#!\/)?\w+\/status(?:es)?\/(\d+)/i,
  );
  return match?.[1] ?? null;
}

/** shortcode de /p/, /reel/ ou /tv/ */
export function extractInstagramShortcode(url: string): string | null {
  const match = url.match(
    /instagram\.com\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i,
  );
  return match?.[1] ?? null;
}

export function detectVideoProvider(url?: string): VideoProvider {
  if (!url) return null;
  if (/youtu\.?be|youtube\.com/i.test(url)) return "youtube";
  if (/vimeo\.com/i.test(url)) return "vimeo";
  if (/drive\.google\.com/i.test(url)) return "drive";
  if (/(?:twitter\.com|x\.com)\//i.test(url) && /\/status\//i.test(url)) {
    return "twitter";
  }
  if (/instagram\.com\/(?:p|reel|reels|tv)\//i.test(url)) return "instagram";
  return null;
}

export function getEmbedUrl(url?: string): string | null {
  if (!url) return null;

  const ytId = extractYoutubeId(url);
  if (ytId) {
    return `https://www.youtube-nocookie.com/embed/${ytId}?rel=0`;
  }

  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    return `https://player.vimeo.com/video/${vimeoId}`;
  }

  const tweetId = extractTweetId(url);
  if (tweetId) {
    // Embed oficial do post (inclui player de vídeo quando houver)
    return `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=dark&dnt=true`;
  }

  const igCode = extractInstagramShortcode(url);
  if (igCode) {
    const path = /instagram\.com\/(?:reel|reels)\//i.test(url)
      ? "reel"
      : /instagram\.com\/tv\//i.test(url)
        ? "tv"
        : "p";
    return `https://www.instagram.com/${path}/${igCode}/embed`;
  }

  const driveId = extractDriveId(url);
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }

  return null;
}

export function isDirectImageUrl(url: string): boolean {
  return /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i.test(url);
}

export function isDirectAudioUrl(url: string): boolean {
  return /\.(mp3|ogg|wav|m4a|aac)(\?|#|$)/i.test(url);
}

export function providerLabelFor(kind: MediaKind): string | undefined {
  switch (kind) {
    case "youtube":
      return "YouTube";
    case "vimeo":
      return "Vimeo";
    case "twitter":
      return "X / Twitter";
    case "instagram":
      return "Instagram";
    case "drive-preview":
    case "drive-image":
      return "Google Drive";
    default:
      return undefined;
  }
}

/**
 * Normaliza mediaUrl conforme a categoria (YouTube, Vimeo, X, Instagram, Drive…).
 */
export function resolveMedia(
  category: Category,
  mediaUrl?: string,
): ResolvedMedia {
  if (!mediaUrl) {
    return { kind: "unknown", playable: false };
  }

  const ytId = extractYoutubeId(mediaUrl);
  if (ytId) {
    return {
      kind: "youtube",
      mediaUrl,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?rel=0`,
      thumbnailUrl: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
      playable: true,
      providerLabel: "YouTube",
    };
  }

  const vimeoId = extractVimeoId(mediaUrl);
  if (vimeoId) {
    return {
      kind: "vimeo",
      mediaUrl,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
      playable: true,
      providerLabel: "Vimeo",
    };
  }

  const tweetId = extractTweetId(mediaUrl);
  if (tweetId && (category === "video" || category === "noticia")) {
    return {
      kind: "twitter",
      mediaUrl,
      embedUrl: `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=dark&dnt=true`,
      playable: category === "video",
      providerLabel: "X / Twitter",
    };
  }

  const igCode = extractInstagramShortcode(mediaUrl);
  if (igCode && (category === "video" || category === "imagem" || category === "noticia")) {
    const path = /instagram\.com\/(?:reel|reels)\//i.test(mediaUrl)
      ? "reel"
      : /instagram\.com\/tv\//i.test(mediaUrl)
        ? "tv"
        : "p";
    return {
      kind: "instagram",
      mediaUrl,
      embedUrl: `https://www.instagram.com/${path}/${igCode}/embed`,
      playable: category === "video" || category === "imagem",
      providerLabel: "Instagram",
    };
  }

  const driveId = extractDriveId(mediaUrl);
  if (driveId) {
    if (category === "imagem") {
      const thumb = `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`;
      return {
        kind: "drive-image",
        mediaUrl: thumb,
        thumbnailUrl: thumb,
        playable: true,
        providerLabel: "Google Drive",
      };
    }
    const preview = `https://drive.google.com/file/d/${driveId}/preview`;
    return {
      kind: "drive-preview",
      mediaUrl,
      embedUrl: preview,
      playable: true,
      providerLabel: "Google Drive",
    };
  }

  if (category === "imagem" && isDirectImageUrl(mediaUrl)) {
    return {
      kind: "direct-image",
      mediaUrl,
      thumbnailUrl: mediaUrl,
      playable: true,
    };
  }

  if (category === "audio" && isDirectAudioUrl(mediaUrl)) {
    return {
      kind: "direct-audio",
      mediaUrl,
      playable: true,
    };
  }

  return {
    kind: "unknown",
    mediaUrl,
    playable: false,
  };
}

export function hasPlayableMedia(
  category: Category,
  mediaUrl?: string,
): boolean {
  if (category === "noticia") return true;
  return resolveMedia(category, mediaUrl).playable;
}

/** Layout do player: widescreen vs. embed social (mais alto). */
export function isSocialEmbed(kind: MediaKind): boolean {
  return kind === "twitter" || kind === "instagram";
}
