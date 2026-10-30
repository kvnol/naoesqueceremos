"use client";

import { useEffect, useRef, useState } from "react";
import type { ContentItem } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { resolveMedia } from "@/lib/media";
import { EmptyState } from "./EmptyState";
import { SourceOnlyCard } from "./SourceOnlyCard";
import { cn } from "@/lib/cn";

interface AudioPlayerProps {
  items: ContentItem[];
  uf?: string;
}

function AudioCard({ item }: { item: ContentItem }) {
  const media = resolveMedia("audio", item.mediaUrl);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setProgress(el.currentTime);
    const onMeta = () => setDuration(el.duration || 0);
    const onEnded = () => setPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("ended", onEnded);
    };
  }, [media.mediaUrl]);

  if (!media.playable) {
    if (media.embedUrl) {
      return (
        <article className="overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--bg-muted)]/40">
          <iframe
            src={media.embedUrl}
            title={item.title}
            className="h-40 w-full border-0"
            allow="autoplay"
          />
          <div className="space-y-1 p-3">
            <h3 className="font-[family-name:var(--font-display)] text-base">
              {item.title}
            </h3>
            <p className="text-sm text-[var(--fg-muted)]">{item.description}</p>
            {item.contributor && (
              <p className="text-xs text-[var(--fg-subtle)]">
                Contribuição de {item.contributor}
              </p>
            )}
          </div>
        </article>
      );
    }
    return <SourceOnlyCard item={item} />;
  }

  // Drive preview for audio
  if (media.kind === "drive-preview" && media.embedUrl) {
    return (
      <article className="overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--bg-muted)]/40">
        <iframe
          src={media.embedUrl}
          title={item.title}
          className="h-40 w-full border-0"
          allow="autoplay"
        />
        <div className="space-y-1 p-3">
          <div className="text-xs text-[var(--fg-subtle)]">
            <time dateTime={item.date}>{formatDate(item.date)}</time>
            <span aria-hidden> · </span>
            <span>{item.sourceName}</span>
          </div>
          <h3 className="font-[family-name:var(--font-display)] text-base">
            {item.title}
          </h3>
          <p className="text-sm text-[var(--fg-muted)]">{item.description}</p>
          {item.contributor && (
            <p className="text-xs text-[var(--fg-subtle)]">
              Contribuição de {item.contributor}
            </p>
          )}
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm text-[var(--accent-soft)] underline-offset-2 hover:underline"
          >
            Fonte original
          </a>
        </div>
      </article>
    );
  }

  async function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      await el.play();
      setPlaying(true);
    }
  }

  function seek(value: number) {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = value;
    setProgress(value);
  }

  function fmt(sec: number) {
    if (!Number.isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }

  return (
    <article className="rounded-sm border border-[var(--line)] bg-[var(--bg-muted)]/50 p-4">
      <audio ref={audioRef} src={media.mediaUrl} preload="none" />
      <div className="mb-1 flex flex-wrap gap-x-2 text-xs text-[var(--fg-subtle)]">
        <time dateTime={item.date}>{formatDate(item.date)}</time>
        <span aria-hidden>·</span>
        <span>{item.sourceName}</span>
      </div>
      <h3 className="font-[family-name:var(--font-display)] text-base text-[var(--fg)]">
        {item.title}
      </h3>
      <p className="mt-1.5 text-sm text-[var(--fg-muted)]">{item.description}</p>
      {item.contributor && (
        <p className="mt-1 text-xs text-[var(--fg-subtle)]">
          Contribuição de {item.contributor}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pausar áudio" : "Reproduzir áudio"}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/60 bg-[var(--accent)]/20 text-[var(--accent-soft)]",
          )}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <div className="min-w-0 flex-1">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={progress}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Progresso do áudio"
            className="w-full accent-[var(--accent)]"
          />
          <div className="mt-0.5 flex justify-between text-[14px] tabular-nums text-[var(--fg-subtle)]">
            <span>{fmt(progress)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>
      </div>

      <a
        href={item.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-sm text-[var(--accent-soft)] underline-offset-2 hover:underline"
      >
        Fonte original
      </a>
    </article>
  );
}

export function AudioPlayerList({ items, uf }: AudioPlayerProps) {
  if (items.length === 0) {
    return <EmptyState uf={uf} message="Nenhum áudio neste recorte." />;
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id}>
          <AudioCard item={item} />
        </li>
      ))}
    </ul>
  );
}
