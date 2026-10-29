export type VideoProvider = "youtube" | "vimeo" | null;

export function detectVideoProvider(url?: string): VideoProvider {
  if (!url) return null;
  if (/youtu\.?be|youtube\.com/i.test(url)) return "youtube";
  if (/vimeo\.com/i.test(url)) return "vimeo";
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

  return null;
}
