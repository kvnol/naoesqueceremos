import type { Category } from "./types";

export type VideoProvider = "youtube" | "vimeo" | "drive" | null;

export type MediaKind =
  | "youtube"
  | "vimeo"
  | "drive-preview"
  | "drive-image"
  | "direct-image"
  | "direct-audio"
  | "unknown";

export interface ResolvedMedia {
  kind: MediaKind;
  mediaUrl?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  playable: boolean;
}

function extractDriveId(url: string): string | null {
  const file = url.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (file?.[1]) return file[1];
  const open = url.match(/[?&]id=([^&]+)/i);
  if (open?.[1] && /drive\.google\.com/i.test(url)) return open[1];
  return null;
}

export function detectVideoProvider(url?: string): VideoProvider {
  if (!url) return null;
  if (/youtu\.?be|youtube\.com/i.test(url)) return "youtube";
  if (/vimeo\.com/i.test(url)) return "vimeo";
  if (/drive\.google\.com/i.test(url)) return "drive";
  return null;
}

export function getEmbedUrl(url?: string): string | null {
  if (!url) return null;

  const yt =
    url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
    ) ?? null;
  if (yt?.[1]) {
    return `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0`;
  }

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/) ?? null;
  if (vimeo?.[1]) {
    return `https://player.vimeo.com/video/${vimeo[1]}`;
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

/**
 * Normaliza mediaUrl conforme a categoria (YouTube, Vimeo, Drive, arquivos diretos).
 */
export function resolveMedia(
  category: Category,
  mediaUrl?: string,
): ResolvedMedia {
  if (!mediaUrl) {
    return { kind: "unknown", playable: false };
  }

  const yt = getEmbedUrl(mediaUrl);
  if (yt && /youtube-nocookie/.test(yt)) {
    const id = yt.match(/embed\/([\w-]{11})/)?.[1];
    return {
      kind: "youtube",
      mediaUrl,
      embedUrl: yt,
      thumbnailUrl: id
        ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
        : undefined,
      playable: true,
    };
  }

  if (yt && /player\.vimeo/.test(yt)) {
    return {
      kind: "vimeo",
      mediaUrl,
      embedUrl: yt,
      playable: true,
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
      };
    }
    const preview = `https://drive.google.com/file/d/${driveId}/preview`;
    return {
      kind: "drive-preview",
      mediaUrl,
      embedUrl: preview,
      playable: true,
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

  // URL presente mas não reconhecida para a categoria
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
