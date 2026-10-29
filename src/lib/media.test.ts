import { describe, expect, it } from "vitest";
import {
  extractInstagramShortcode,
  extractTweetId,
  extractYoutubeId,
  getEmbedUrl,
  resolveMedia,
} from "./media";

describe("extractYoutubeId", () => {
  it("aceita watch, youtu.be e shorts", () => {
    expect(extractYoutubeId("https://www.youtube.com/watch?v=aqz-KE-bpKQ")).toBe(
      "aqz-KE-bpKQ",
    );
    expect(extractYoutubeId("https://youtu.be/aqz-KE-bpKQ")).toBe("aqz-KE-bpKQ");
    expect(extractYoutubeId("https://www.youtube.com/shorts/aqz-KE-bpKQ")).toBe(
      "aqz-KE-bpKQ",
    );
  });
});

describe("extractTweetId", () => {
  it("aceita twitter.com e x.com", () => {
    expect(
      extractTweetId("https://twitter.com/user/status/1234567890123456789"),
    ).toBe("1234567890123456789");
    expect(
      extractTweetId("https://x.com/user/status/1234567890123456789?s=20"),
    ).toBe("1234567890123456789");
  });
});

describe("extractInstagramShortcode", () => {
  it("aceita p e reel", () => {
    expect(
      extractInstagramShortcode("https://www.instagram.com/p/AbC123xyz/"),
    ).toBe("AbC123xyz");
    expect(
      extractInstagramShortcode("https://www.instagram.com/reel/DeF456_-/"),
    ).toBe("DeF456_-");
  });
});

describe("getEmbedUrl / resolveMedia vídeo social", () => {
  it("monta embeds de YouTube, X e Instagram", () => {
    expect(getEmbedUrl("https://youtu.be/aqz-KE-bpKQ")).toContain(
      "youtube-nocookie.com/embed/aqz-KE-bpKQ",
    );
    expect(
      getEmbedUrl("https://x.com/user/status/1234567890123456789"),
    ).toContain("platform.twitter.com/embed/Tweet.html?id=1234567890123456789");
    expect(
      getEmbedUrl("https://www.instagram.com/reel/AbC123/"),
    ).toContain("instagram.com/reel/AbC123/embed");
  });

  it("marca como playable na categoria video", () => {
    expect(
      resolveMedia("video", "https://x.com/a/status/1").playable,
    ).toBe(true);
    expect(
      resolveMedia("video", "https://www.instagram.com/p/xyz/").playable,
    ).toBe(true);
    expect(
      resolveMedia("video", "https://www.youtube.com/watch?v=aqz-KE-bpKQ")
        .playable,
    ).toBe(true);
  });
});
