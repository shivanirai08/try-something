import { getRequiredEnv } from "@/lib/env";

type YoutubeSearchResponse = {
  items?: Array<{
    id?: { videoId?: string };
  }>;
};

export async function searchYoutubeVideo(query: string) {
  const apiKey = getRequiredEnv("YOUTUBE_API_KEY");
  const url = new URL("https://www.googleapis.com/youtube/v3/search");

  url.searchParams.set("part", "snippet");
  url.searchParams.set("maxResults", "1");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "video");
  url.searchParams.set("videoCategoryId", "10");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to search YouTube.");
  }

  const data = (await response.json()) as YoutubeSearchResponse;
  const videoId = data.items?.[0]?.id?.videoId ?? null;

  if (!videoId) {
    return null;
  }

  return {
    videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
  };
}
